#!/usr/bin/env bash
# =============================================================================
# Bootstrap the boutique-secrets Kubernetes Secret from your local .env file.
#
# WHY THIS EXISTS
#   Secrets must never be committed to Git. ArgoCD syncs everything under
#   gitops/, so the Secret is created here — out-of-band — and ArgoCD is
#   configured to leave it alone.
#
# USAGE
#   ./scripts/bootstrap-secrets.sh
#
# PREREQUISITES
#   - kubectl pointed at the target cluster
#   - projects/boutique-microservices/.env populated (see .env.example)
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${REPO_ROOT}/projects/boutique-microservices/.env"
NAMESPACE="boutique"
SECRET_NAME="boutique-secrets"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found."
  echo "       cp projects/boutique-microservices/.env.example projects/boutique-microservices/.env"
  exit 1
fi

# Load .env without exporting comments or blank lines.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# ---------------------------------------------------------------------------
# Validate: refuse to deploy placeholder or weak secrets.
# ---------------------------------------------------------------------------
fail=0

require() {
  local name="$1" value="${2:-}" minlen="${3:-1}"
  if [[ -z "$value" ]]; then
    echo "  ✗ $name is empty"
    fail=1
  elif [[ "$value" == *CHANGE_ME* ]]; then
    echo "  ✗ $name still contains the CHANGE_ME placeholder"
    fail=1
  elif (( ${#value} < minlen )); then
    echo "  ✗ $name is shorter than $minlen characters (got ${#value})"
    fail=1
  else
    echo "  ✓ $name"
  fi
}

echo "Validating secrets from .env ..."
require POSTGRES_USER      "${POSTGRES_USER:-}"      3
require POSTGRES_PASSWORD  "${POSTGRES_PASSWORD:-}"  16
require JWT_ACCESS_SECRET  "${JWT_ACCESS_SECRET:-}"  32
require JWT_REFRESH_SECRET "${JWT_REFRESH_SECRET:-}" 32

if [[ "${JWT_ACCESS_SECRET:-}" == "${JWT_REFRESH_SECRET:-}" ]]; then
  echo "  ✗ JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different"
  echo "    (identical secrets allow a refresh token to be replayed as an access token)"
  fail=1
fi

if (( fail )); then
  echo ""
  echo "Aborted. Generate strong values with: openssl rand -base64 48"
  exit 1
fi

# ---------------------------------------------------------------------------
# Apply
# ---------------------------------------------------------------------------
PG_DB="${POSTGRES_DB:-postgres}"
PG_HOST="boutique-postgres"

echo ""
echo "Applying Secret '$SECRET_NAME' to namespace '$NAMESPACE' ..."

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic "$SECRET_NAME" \
  --namespace "$NAMESPACE" \
  --from-literal=POSTGRES_DB="$PG_DB" \
  --from-literal=POSTGRES_USER="$POSTGRES_USER" \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=JWT_ACCESS_SECRET="$JWT_ACCESS_SECRET" \
  --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  --from-literal=AUTH_DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${PG_HOST}:5432/auth_db" \
  --from-literal=PRODUCTS_DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${PG_HOST}:5432/products_db" \
  --from-literal=ORDERS_DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${PG_HOST}:5432/orders_db" \
  --from-literal=USERS_DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${PG_HOST}:5432/users_db" \
  --dry-run=client -o yaml | kubectl apply -f -

# Tell ArgoCD this resource is managed outside Git so self-heal/prune skip it.
kubectl annotate secret "$SECRET_NAME" -n "$NAMESPACE" --overwrite \
  argocd.argoproj.io/sync-options=Prune=false \
  argocd.argoproj.io/compare-options=IgnoreExtraneous >/dev/null

echo ""
echo "Done. Secret '$SECRET_NAME' created/updated in namespace '$NAMESPACE'."
echo "It is annotated so ArgoCD will not prune or overwrite it."
