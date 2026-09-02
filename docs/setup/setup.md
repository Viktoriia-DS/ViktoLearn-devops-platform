# ViktoLearn Setup Guide

This guide describes how to run and validate ViktoLearn locally.

## Prerequisites

Install:

- Git
- Python 3.13+
- Docker Desktop
- kubectl
- Helm
- Kind

Additional platform components include Argo CD, Prometheus, Grafana, Loki, Grafana Alloy, Envoy Gateway, and MetalLB.

## 1. Clone the Repository

```bash
git clone git@github.com:Viktoriia-DS/ViktoLearn-devops-platform.git
cd ViktoLearn-devops-platform
```

## 2. Python Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Environment Configuration

Create a local `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viktolearn
DB_USER=viktolearn
DB_PASSWORD=viktolearn
```

The `.env` file is for local development and is excluded from Git.

## 4. Docker Compose

Start FastAPI, PostgreSQL, and Redis:

```bash
docker compose up --build
```

Check the containers:

```bash
docker compose ps
```

Useful endpoints:

- `http://localhost:8000/`
- `http://localhost:8000/health`
- `http://localhost:8000/ready`
- `http://localhost:8000/metrics`
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`
- `http://localhost:8000/cache/demo`

Stop the environment:

```bash
docker compose down
```

## 5. Tests and Quality Checks

```bash
pytest
ruff check .
black --check .
```

## 6. Local Kubernetes Cluster

Create the Kind cluster if it does not already exist:

```bash
kind create cluster --name viktolearn-devops
kubectl cluster-info --context kind-viktolearn-devops
kubectl get nodes
```

## 7. Validate the Helm Chart

```bash
helm lint helm/viktolearn
helm template viktolearn helm/viktolearn > /tmp/viktolearn-rendered.yaml
python scripts/validate-kubernetes.py /tmp/viktolearn-rendered.yaml
```

## 8. GitOps Deployment

The normal deployment path uses Argo CD. Its Application definition is stored at `argocd/viktolearn-application.yaml`.

It tracks the `main` branch and the `helm/viktolearn` chart and deploys into the `viktolearn-helm` namespace.

After Argo CD is installed:

```bash
kubectl apply -f argocd/viktolearn-application.yaml
kubectl get application viktolearn -n argocd
```

The expected application state after successful reconciliation is `Synced` and `Healthy`.

## 9. Verify the Deployment

```bash
kubectl get pods -n viktolearn-helm
kubectl get svc -n viktolearn-helm
kubectl get gateway -n viktolearn-helm
kubectl get httproute -n viktolearn-helm
kubectl logs -n viktolearn-helm deployment/api
```

## Notes

ViktoLearn is intentionally local-first. Argo CD, the monitoring stack, Envoy Gateway, and MetalLB must be installed before their corresponding configuration can operate.

The repository documents the completed development environment rather than providing a single bootstrap script for every third-party component.
