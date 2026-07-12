<p align="center">
  <h1 align="center">🚀 DevOps + AIOps Playbook</h1>
  <p align="center">
    An end-to-end DevOps project with AIOps integration — from local development to production on AWS EKS, with CI/CD, GitOps, observability, and an AI-powered SRE assistant.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes" />
  <img src="https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform" />
  <img src="https://img.shields.io/badge/AWS_EKS-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS EKS" />
  <img src="https://img.shields.io/badge/ArgoCD-EF7B4D?style=for-the-badge&logo=argo&logoColor=white" alt="ArgoCD" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus" />
  <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" />
  <img src="https://img.shields.io/badge/AWS_Bedrock-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS Bedrock" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Repository Structure](#-repository-structure)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start — Local Development](#-quick-start--local-development)
- [Full Deployment Guide — AWS EKS](#-full-deployment-guide--aws-eks)
  - [Step 1: Provision Infrastructure](#step-1-provision-infrastructure-with-terraform)
  - [Step 2: Configure kubectl](#step-2-configure-kubectl)
  - [Step 3: Build & Push Images (CI)](#step-3-build--push-images-ci)
  - [Step 4: Deploy via ArgoCD (GitOps)](#step-4-deploy-via-argocd-gitops)
  - [Step 5: Access the Application](#step-5-access-the-application)
  - [Step 6: Set Up Observability](#step-6-set-up-observability)
  - [Step 7: AIOps Integration (Kira)](#step-7-aiops-integration-kira)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Series & Learning Guide](#-series--learning-guide)
- [Redeployment & Day-2 Operations](#-redeployment--day-2-operations)
- [Teardown — Stop Billing](#-teardown--stop-billing)
- [Troubleshooting](#-troubleshooting)
- [Bonus Challenge](#-bonus-challenge)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

This repository is a comprehensive, production-style DevOps project that demonstrates how modern systems are designed, deployed, and operated — with AI-powered operations built in.

**What you'll build:**

- A **7-service e-commerce microservices app** (React + Node.js + PostgreSQL)
- **Containerised** with Docker, orchestrated on **Kubernetes (AWS EKS)**
- Infrastructure provisioned with **Terraform** (VPC, EKS, ECR, ArgoCD, monitoring)
- **CI/CD** with GitHub Actions — automatic image builds & manifest updates
- **GitOps** with ArgoCD — auto-sync from Git to the cluster
- **Observability** with Prometheus + Grafana (pre-loaded dashboards)
- **AIOps assistant (Kira)** — an AI agent on AWS Bedrock that diagnoses production incidents in real time

> This project is a companion to the **DevOps + AIOps YouTube series**. Each part of the series maps to a section of this repository.

---

## 🏗 Architecture

### Application Architecture

```
                                    ┌─────────────┐
                                    │   Frontend  │
                                    │ (Port 3000) │
                                    └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │   Gateway   │
                                    │ (Port 3001) │
                                    └──────┬──────┘
                                           │
            ┌──────────────────────────────┼──────────────────────────────┐
            │                              │                              │
     ┌──────▼──────┐              ┌────────▼──────┐             ┌────────▼──────┐
     │    Auth     │              │Product Service│             │  User Service │
     │ (Port 3002) │              │  (Port 3003)  │             │  (Port 3006)  │
     └──────┬──────┘              └───────┬───────┘             └───────┬───────┘
            │                             │
     ┌──────▼──────┐              ┌───────▼───────┐
     │Order Service│              │    Orders     │
     │ (Port 3004) │              │  (Port 3005)  │
     └──────┬──────┘              └───────────────┘
            │
     ┌──────▼──────┐
     │  PostgreSQL │
     │ (Port 5432) │
     └─────────────┘
```

### DevOps Pipeline Flow

```
Developer → Git Push → GitHub Actions CI → ECR Images → ArgoCD GitOps → EKS Cluster
                                                                            │
                                                        Prometheus + Grafana ◄┘
                                                                │
                                                        CloudWatch Logs
                                                                │
                                                        Kira (AIOps Agent)
```

| Service | Port | Role |
|---------|------|------|
| Frontend | 3000 | React UI for the boutique store |
| Gateway | 3001 | API gateway — routes all client requests to backend services |
| Auth | 3002 | User login and registration |
| Product Service | 3003 | Product catalog and inventory |
| Order Service | 3004 | Cart and checkout processing |
| Orders | 3005 | Order history and management |
| User Service | 3006 | User profiles and account management |
| PostgreSQL | 5432 | Stores `auth_db`, `products_db`, `orders_db`, `users_db` |
| Prometheus | 9090 | Metrics collection and alerting |
| Grafana | 8080 | Metrics visualisation dashboards |

---

## 📁 Repository Structure

```
devops-ai-playbook/
│
├── docs/                                # 📖 Learning & documentation
│   ├── part1-system-design.md           #    System design foundations (12 pillars)
│   ├── part1-beginner-concepts.md       #    Beginner-friendly concepts
│   ├── part2-workflow.md                #    Full pipeline workflow with AIOps
│   ├── claude-setup.md                  #    Claude Code + MCP server setup
│   └── assets/                          #    Images and diagrams
│
├── projects/                            # 🔨 All project code
│   ├── README.md                        #    Detailed deployment guide
│   ├── Issues.md                        #    Known issues & fixes encountered
│   ├── boutique-microservices/          #    The application (7 services)
│   │   ├── frontend/                    #      React UI (TypeScript)
│   │   ├── backend/services/            #      6 Node.js microservices
│   │   │   ├── auth/
│   │   │   ├── gateway/
│   │   │   ├── order-service/
│   │   │   ├── orders/
│   │   │   ├── product-service/
│   │   │   └── user-service/
│   │   ├── database/                    #      SQL seed data & init scripts
│   │   ├── grafana/                     #      Grafana dashboard JSON
│   │   ├── prometheus/                  #      Prometheus config
│   │   ├── docker-compose.yml           #      Run everything locally
│   │   └── package.json                 #      Workspace scripts
│   │
│   ├── Infrastructure/                  #    Terraform for AWS provisioning
│   │   ├── main.tf                      #      Root module — wires VPC, EKS, ECR, ArgoCD
│   │   ├── variables.tf / terraform.tfvars
│   │   └── modules/
│   │       ├── vpc/                     #      VPC + 3 public subnets
│   │       ├── eks/                     #      EKS cluster + node group + IRSA
│   │       ├── ecr/                     #      7 ECR repositories
│   │       └── argocd/                  #      ArgoCD Helm install
│   │
│   └── aiops-assistant/                 #    AIOps agent — Kira
│       ├── app.py                       #      Streamlit chat UI
│       ├── deploy.sh                    #      Bedrock Agent deployment
│       ├── setup-iam.sh                 #      IAM roles & policies
│       ├── lambda/                      #      3 Lambda functions
│       │   ├── fetch_logs/              #        CloudWatch Logs query
│       │   ├── fetch_metrics/           #        Prometheus metrics query
│       │   └── fetch_health/            #        EKS cluster health check
│       └── schemas/                     #      OpenAPI schemas for Bedrock
│
├── gitops/                              # 🔄 GitOps manifests (ArgoCD watches this)
│   ├── argo-cd.yml                      #    ArgoCD Application definition
│   ├── kustomization.yml                #    Kustomize entry point
│   ├── namespace.yml                    #    Boutique namespace
│   ├── secrets.yml                      #    DB connection secrets
│   └── k8s/                             #    Kubernetes manifests
│       ├── backend/                     #      Deployment + Service per backend service
│       ├── frontend/                    #      Frontend Deployment + Service
│       ├── database/                    #      PostgreSQL StatefulSet + restore Job
│       └── grafana-dashboard.yml        #      Pre-loaded Grafana dashboard (ConfigMap)
│
├── .github/workflows/                   # ⚙️ CI/CD
│   └── ci.yml                           #    GitHub Actions — build, push, update manifests
│
├── RUNBOOK.md                           # 📘 Step-by-step deploy & teardown guide
├── CLAUDE.md                            # 🤖 Claude Code instruction file
└── .gitignore
```

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React (TypeScript) | E-commerce store UI |
| **Backend** | Node.js | 6 microservices (Gateway, Auth, Products, Orders, User, Order Service) |
| **Database** | PostgreSQL | 4 databases — `auth_db`, `products_db`, `orders_db`, `users_db` |
| **Containers** | Docker, Docker Compose | Local development & image builds |
| **Orchestration** | Kubernetes (AWS EKS) | Production container orchestration |
| **Infrastructure** | Terraform | IaC — VPC, EKS, ECR, ArgoCD, monitoring |
| **CI/CD** | GitHub Actions | Auto-build images, push to ECR, update manifests |
| **GitOps** | ArgoCD + Kustomize | Auto-deploy from Git to cluster |
| **Monitoring** | Prometheus + Grafana | Metrics, dashboards, alerting |
| **Log Forwarding** | AWS Fluent Bit → CloudWatch | Centralised log collection |
| **AIOps** | AWS Bedrock Agent (Kira) | AI-powered incident diagnosis |
| **AI Assistant** | Claude Code + MCP Servers | AI-assisted development workflow |

---

## ✅ Prerequisites

### For Local Development (Docker)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/downloads)

### For AWS Deployment (Full Stack)
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) — configured with IAM credentials
- [Terraform](https://developer.hashicorp.com/terraform/install) ≥ 1.5
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Node.js](https://nodejs.org/) 18+ (optional — only for running without Docker)
- [Python 3.10+](https://www.python.org/downloads/) (only for the AIOps assistant)

### GitHub Repository Secrets (for CI/CD)

Go to your repo → **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | Your IAM access key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret key |
| `AWS_REGION` | `us-east-1` (or your preferred region) |
| `AWS_ACCOUNT_ID` | Your 12-digit AWS account ID |

Find your account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

---

## ⚡ Quick Start — Local Development

Get the entire app running locally in under 5 minutes — **no AWS account needed**.

```bash
# 1. Clone the repository
git clone https://github.com/jimilprabtani/DevOps-Project-02.git
cd DevOps-Project-02

# 2. Start all services with Docker Compose
cd projects/boutique-microservices
docker-compose up -d

# 3. Verify all containers are running
docker ps
```

### Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| 🛒 Store Frontend | http://localhost:3000 | — |
| 📊 Grafana | http://localhost:3007 | `admin` / `admin` |
| 📈 Prometheus | http://localhost:9090 | — |
| 🔗 Gateway Metrics | http://localhost:3001/metrics | — |

### Run Without Docker (Node.js)

```bash
cd projects/boutique-microservices
npm install
npm run dev              # Starts all services concurrently
```

Or individually:

```bash
npm run dev:frontend     # React frontend only
npm run dev:backend      # All backend services
```

### Stop All Services

```bash
docker-compose down
```

---

## ☁️ Full Deployment Guide — AWS EKS

> **⚠️ Important: Order matters.** Build images (CI) *before* letting ArgoCD deploy. If container images aren't in ECR yet, pods will fail with `ImagePullBackOff`.

### Step 1: Provision Infrastructure with Terraform

This creates: VPC (3 public subnets), EKS cluster, node group, 7 ECR repositories, ArgoCD, and Prometheus + Grafana.

```bash
cd projects/Infrastructure
terraform init
terraform plan              # Review what will be created
terraform apply             # Type 'yes' to confirm (~15–20 minutes)
```

### Step 2: Configure kubectl

```bash
aws eks update-kubeconfig --region us-east-1 --name eks-cluster

# Verify nodes are ready
kubectl get nodes           # Should show 1 node as Ready
```

### Step 3: Build & Push Images (CI)

The ECR repos are **empty** after `terraform apply`. Run the CI pipeline to fill them:

1. Go to your GitHub repo → **Actions** tab → **Boutique CI Pipeline** → **Run workflow**
2. The pipeline builds all 7 images, pushes to ECR, and auto-updates image tags in `gitops/k8s/`
3. Pull the auto-committed manifest changes:

```bash
git pull
```

### Step 4: Deploy via ArgoCD (GitOps)

```bash
kubectl apply -f gitops/argo-cd.yml
```

Auto-sync is enabled — ArgoCD deploys automatically. Watch it:

```bash
kubectl get pods -n boutique -w
kubectl wait --for=condition=available deployment --all -n boutique --timeout=300s
```

### Step 5: Access the Application

```bash
# Port-forward the frontend
kubectl port-forward -n boutique svc/frontend 3000:3000
```

Open http://localhost:3000. (`Ctrl+C` to stop.)

**All port forwards at once:**

```bash
kubectl port-forward svc/frontend 3000:3000 -n boutique &
kubectl port-forward svc/gateway 3001:3001 -n boutique &
kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n monitoring &
kubectl port-forward svc/kube-prometheus-stack-grafana 8080:80 -n monitoring &
kubectl port-forward svc/argocd-server 8443:443 -n argocd &
```

| Service | URL |
|---------|-----|
| 🛒 Frontend | http://localhost:3000 |
| 🔗 Gateway Metrics | http://localhost:3001/metrics |
| 📈 Prometheus | http://localhost:9090 |
| 📊 Grafana | http://localhost:8080 |
| 🔄 ArgoCD UI | https://localhost:8443 |

### Step 6: Set Up Observability

#### Grafana Credentials

```bash
# Username: admin
# Password:
kubectl get secret kube-prometheus-stack-grafana -n monitoring \
  -o jsonpath="{.data.admin-password}" | base64 --decode
```

A **Boutique Microservices** dashboard is pre-loaded automatically (via a ConfigMap sidecar) with panels for:

- Request rate per service (by status code)
- p95/p99 response times
- 5xx error rates
- Pod CPU/memory usage
- Pod restart counts
- Node.js heap memory & event loop lag
- Service health (UP/DOWN)

#### ArgoCD Credentials

```bash
# Username: admin
# Password:
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

#### Optional: Log Forwarding to CloudWatch

```bash
helm repo add aws https://aws.github.io/eks-charts
helm repo update

helm upgrade --install aws-for-fluent-bit aws/aws-for-fluent-bit \
  --namespace amazon-cloudwatch \
  --create-namespace \
  --set cloudWatch.enabled=true \
  --set cloudWatch.region=us-east-1 \
  --set cloudWatch.logGroupName=/eks/boutique/pods \
  --set cloudWatch.logStreamPrefix=from-fluent-bit- \
  --set firehose.enabled=false \
  --set kinesis.enabled=false \
  --set elasticsearch.enabled=false
```

### Step 7: AIOps Integration (Kira)

Kira is an AI-powered SRE assistant built on AWS Bedrock. She diagnoses production incidents by querying CloudWatch Logs, Prometheus metrics, and EKS cluster health.

See the full setup guide: [`projects/aiops-assistant/README.md`](projects/aiops-assistant/README.md)

**Quick overview:**

```bash
cd projects/aiops-assistant

# 1. Create IAM roles
chmod +x setup-iam.sh && ./setup-iam.sh

# 2. Create 3 Lambda functions (fetch_logs, fetch_metrics, fetch_health)
#    → See the AIOps README for details

# 3. Deploy the Bedrock Agent
chmod +x deploy.sh && ./deploy.sh

# 4. Run the Streamlit chat UI
cp .env.example .env          # Fill in your Agent ID
pip install -r requirements.txt
streamlit run app.py           # Open http://localhost:8501
```

**Example questions for Kira:**

- *"Why are we seeing 503 errors in the last hour?"*
- *"Is CPU usage high across the boutique services?"*
- *"Are all pods healthy? Any restarts?"*
- *"What are the most frequent errors in the last 2 hours?"*

---

## ⚙️ CI/CD Pipeline

The GitHub Actions pipeline (`.github/workflows/ci.yml`) is triggered manually via `workflow_dispatch`.

```
Push to main / manual trigger
       │
       ▼
build-and-push (7 parallel matrix jobs)
  └── For each service: docker build → push to ECR
       │
       ▼
update-manifests
  └── Updates image tags in gitops/k8s/ with the commit SHA
  └── Commits the changes back to main
       │
       ▼
ArgoCD auto-syncs the new image tags → zero-downtime rolling update
```

**Services built:** `auth`, `gateway`, `orders`, `order-service`, `product-service`, `user-service`, `frontend`

---

## 📖 Series & Learning Guide

This project is structured as a 4-part learning series:

| Part | Topic | Document |
|------|-------|----------|
| **Setup** | Claude Code + MCP Server configuration | [`docs/claude-setup.md`](docs/claude-setup.md) |
| **Part 1** | System Design Foundations — 12 core pillars | [`docs/part1-system-design.md`](docs/part1-system-design.md) |
| **Part 1b** | Beginner-friendly concepts | [`docs/part1-beginner-concepts.md`](docs/part1-beginner-concepts.md) |
| **Part 2** | Full Workflow — developer to AIOps | [`docs/part2-workflow.md`](docs/part2-workflow.md) |
| **Part 3** | Hands-on Deployment — Docker → K8s → CI/CD → GitOps | [`projects/README.md`](projects/README.md) |
| **Part 4** | AIOps Integration — Kira (Bedrock Agent) | [`projects/aiops-assistant/README.md`](projects/aiops-assistant/README.md) |

### AI-Assisted Development with Claude

This project uses **Claude Code** with **MCP Servers** for AI-assisted DevOps workflows:

| MCP Server | Capability |
|------------|-----------|
| `awslabs.eks-mcp-server` | Query EKS clusters, inspect pods, stream logs, apply manifests |
| `awslabs.terraform-mcp-server` | Run Terraform commands, search provider docs, run Checkov scans |
| `awslabs.aws-pricing-mcp-server` | Live AWS pricing lookups and cost analysis |

See [`docs/claude-setup.md`](docs/claude-setup.md) for the full setup guide.

---

## 🔁 Redeployment & Day-2 Operations

### Redeploy After a Code Change

```bash
git push origin main
# Run the Boutique CI Pipeline in GitHub Actions
# ArgoCD auto-syncs → zero-downtime rolling update
```

### Manual Kubernetes Deploy (without ArgoCD)

```bash
kubectl apply -k gitops/
kubectl get pods -n boutique
```

### Restore the Database (if needed)

```bash
# Wait for PostgreSQL pod to be ready
kubectl get pods -n boutique -l app=boutique-postgres

# Apply the restore job
kubectl apply -f gitops/k8s/database/restore-job.yml

# Check status
kubectl logs -n boutique -l job-name=boutique-db-restore
```

---

## 💣 Teardown — Stop Billing

> **Order matters:** Delete the app first so Kubernetes cleans up EBS volumes. Otherwise `terraform destroy` leaves orphaned billing resources.

```bash
# 1. Delete the application namespace (releases EBS volumes)
kubectl delete namespace boutique

# 2. Verify EBS volumes are gone
aws ec2 describe-volumes --region us-east-1 \
  --filters "Name=tag:kubernetes.io/cluster/eks-cluster,Values=owned" \
  --query 'Volumes[].VolumeId' --output text

# 3. Destroy all AWS infrastructure
cd projects/Infrastructure
terraform destroy           # Type 'yes' to confirm (~15 minutes)
```

### Verify Nothing Is Left Billing

```bash
aws eks list-clusters --region us-east-1
aws ec2 describe-instances --region us-east-1 \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].InstanceId'
aws elbv2 describe-load-balancers --region us-east-1 \
  --query 'LoadBalancers[].LoadBalancerName'
aws ec2 describe-volumes --region us-east-1 \
  --query 'Volumes[].VolumeId'
aws ecr describe-repositories --region us-east-1 \
  --query 'repositories[].repositoryName'
```

All should return empty results.

---

## 🔧 Troubleshooting

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `dial tcp [::1]:8080: connection refused` | kubectl has no cluster configured | Run `aws eks update-kubeconfig --region us-east-1 --name eks-cluster` |
| Pods `InvalidImageName` | Image string has an unfilled placeholder like `<AWS_ACCOUNT_ID>` | Run the CI pipeline — the `update-manifests` job fills in real values |
| Pods `ImagePullBackOff` / `ErrImagePull` | Image tag in Git doesn't exist in ECR | Run CI pipeline **before** deploying via ArgoCD, then `git pull` |
| App stuck `OutOfSync` in ArgoCD | Cluster drifted from Git state | Auto-sync + self-heal is enabled; or click **Sync** in ArgoCD UI |
| `terraform destroy` hangs on VPC | LoadBalancer/PVC created AWS resources Terraform doesn't track | Delete the `boutique` namespace first |
| `too many pods` on node | Instance type pod capacity exceeded | Upgrade instance type (e.g. `t3.medium` → `t3.large`). See [Issues.md](projects/Issues.md) |
| PostgreSQL init script skipped | EBS `lost+found` directory makes Postgres skip init | Use the DB restore Job instead. See [Issues.md](projects/Issues.md) |
| Boutique metrics missing in Grafana | ServiceMonitor misconfigured | Ensure ServiceMonitor has correct path (`/metrics`) and `release: kube-prometheus-stack` label |

For a detailed runbook with step-by-step deploy & teardown instructions, see [`RUNBOOK.md`](RUNBOOK.md).

For all implementation issues encountered and their solutions, see [`projects/Issues.md`](projects/Issues.md).

---

## 🧩 Bonus Challenge

This repository includes **intentional issues and troubleshooting tasks**.

> AI has made things easier. But to grow as an engineer, you must learn how to break, debug, and fix systems.

1. **Fork** this repository
2. **Deploy** the full system on AWS
3. **Troubleshoot** the issues you encounter
4. **Share** what you learned — and tag the author so they know you're building along!

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available for educational purposes.

---

<p align="center">
  <b>Built with ❤️ for the DevOps community</b>
  <br />
  <i>If this helped you learn, give it a ⭐ and share it!</i>
</p>
