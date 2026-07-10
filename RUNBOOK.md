# Boutique — Deploy & Teardown Runbook

A step-by-step guide to spin this project up cleanly and tear it down completely.
Following the **order** below avoids the common errors (no cluster configured,
`InvalidImageName`, `ImagePullBackOff`, manual sync).

> **Why order matters:** ArgoCD deploys whatever image tag is in Git. If the
> container images aren't in ECR **yet**, the pods fail. So the golden rule is:
> **build images (CI) → *then* let ArgoCD deploy.**

---

## Prerequisites (one-time)

- AWS CLI configured (`aws sts get-caller-identity` should return account `123209654419`).
- `kubectl`, `terraform`, and `git` installed.
- **GitHub repo secrets** set (Settings → Secrets and variables → Actions), used by `.github/workflows/ci.yml`:
  | Secret | Value |
  |---|---|
  | `AWS_ACCESS_KEY_ID` | your IAM access key |
  | `AWS_SECRET_ACCESS_KEY` | your IAM secret |
  | `AWS_REGION` | `us-east-1` |
  | `AWS_ACCOUNT_ID` | `123209654419` |

---

## Part A — Deploy from scratch

### 1. Provision the AWS infrastructure (Terraform)
Creates the VPC, EKS cluster + node, the 7 (empty) ECR repos, and installs ArgoCD + monitoring.
```bash
cd projects/Infrastructure
terraform init
terraform apply        # review the plan, then type: yes   (~15-20 min)
```

### 2. Point kubectl at the new cluster
> This is what fixes the `dial tcp [::1]:8080 ... connection refused` error —
> that error just means kubectl has no cluster configured yet.
```bash
aws eks update-kubeconfig --region us-east-1 --name eks-cluster
kubectl get nodes      # should show 1 node as Ready
```

### 3. Build & push the container images (CI) — DO THIS BEFORE DEPLOYING
The ECR repos are empty right after `terraform apply`. Run the pipeline to fill them.
- GitHub → **Actions** tab → **"Boutique CI Pipeline"** → **Run workflow**.
- It builds all 7 images, pushes them to ECR tagged with the commit SHA, **and
  auto-updates the image tags in `gitops/k8s/`** and commits that back to `main`.

Then pull that auto-commit locally:
```bash
git pull
```

### 4. Deploy the app (ArgoCD / GitOps)
```bash
kubectl apply -f gitops/argo-cd.yml
```
Auto-sync is now **enabled**, so ArgoCD deploys automatically — no manual "Sync" click needed.
Watch it come up:
```bash
kubectl get pods -n boutique -w
kubectl wait --for=condition=available deployment --all -n boutique --timeout=300s
```
All pods should reach `Running`. (See Troubleshooting if not.)

### 5. Access the store
```bash
kubectl port-forward -n boutique svc/frontend 3000:3000
```
Open <http://localhost:3000>. (`Ctrl+C` to stop.)
For a shareable public URL instead, change the `frontend` Service to
`type: LoadBalancer` — but remember it costs money and is public.

---

## Part B — Redeploy after a code change
1. `git push` your code change.
2. Run the **Boutique CI Pipeline** workflow (rebuilds images, bumps the tag in Git).
3. ArgoCD auto-syncs the new tag with a zero-downtime rolling update. Done.

---

## Part C — Teardown (delete everything, stop billing)

> **Order matters:** delete the app first so Kubernetes cleans up the Postgres
> EBS disk. Otherwise `terraform destroy` leaves an orphaned (billing) volume.

```bash
# 1. Delete the app — releases the Postgres EBS volume
kubectl delete namespace boutique

# 2. Confirm the EBS volume is gone (should print nothing / not-found)
aws ec2 describe-volumes --region us-east-1 \
  --filters "Name=tag:kubernetes.io/cluster/eks-cluster,Values=owned" \
  --query 'Volumes[].VolumeId' --output text

# 3. Destroy all infrastructure
cd projects/Infrastructure
terraform destroy      # type: yes   (~15 min)
```

### Verify nothing is left billing
```bash
aws eks list-clusters --region us-east-1
aws ec2 describe-instances --region us-east-1 \
  --filters "Name=instance-state-name,Values=running" --query 'Reservations[].Instances[].InstanceId'
aws elbv2 describe-load-balancers --region us-east-1 --query 'LoadBalancers[].LoadBalancerName'
aws ec2 describe-volumes --region us-east-1 --query 'Volumes[].VolumeId'
aws ecr describe-repositories --region us-east-1 --query 'repositories[].repositoryName'
```
All should be empty.

---

## Troubleshooting — errors seen before & their fixes

| Symptom | Root cause | Fix |
|---|---|---|
| `dial tcp [::1]:8080: connection refused` | kubectl has no cluster configured | `aws eks update-kubeconfig --region us-east-1 --name eks-cluster` (Part A step 2) |
| Pods `InvalidImageName` | Image string has an unfilled placeholder like `<AWS_ACCOUNT_ID>` | Ensure the real account ID is in the manifests; the CI's `update-manifests` job keeps them valid |
| Pods `ImagePullBackOff` / `ErrImagePull` | Image tag in Git doesn't exist in ECR (didn't run CI, or ran ArgoCD too early) | Run the CI pipeline (Part A step 3) **before** deploying, then `git pull` |
| App stuck `OutOfSync` in ArgoCD | Cluster drifted from Git | With auto-sync + self-heal (now enabled) ArgoCD self-corrects; or click **Sync** |
| `terraform destroy` hangs on the VPC | A `LoadBalancer` Service or PVC created AWS resources Terraform doesn't track | Delete the `boutique` namespace first (Part C step 1) |
