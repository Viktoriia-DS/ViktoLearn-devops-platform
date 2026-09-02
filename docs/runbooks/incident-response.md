# ViktoLearn Incident Response Runbook

## Purpose

This runbook provides diagnostic and recovery procedures for common
ViktoLearn production-style incidents running on Kubernetes.

## Initial Triage

Check the overall platform state:

```bash
kubectl get application viktolearn -n argocd
kubectl get deployments -n viktolearn-helm
kubectl get pods -n viktolearn-helm
```

Expected healthy state:

- Argo CD: Synced / Healthy
- API: Ready
- PostgreSQL: Ready
- Redis: Ready

## 1. API Endpoint Failure

Check application health:

```bash
kubectl port-forward -n viktolearn-helm svc/api 8000:8000
curl -i http://127.0.0.1:8000/health
```

Check API logs:

```bash
kubectl logs -n viktolearn-helm -l app=api --tail=100
```

Before deployment:

```bash
pytest
```

Automated tests should prevent known endpoint regressions from reaching
the deployment pipeline.

## 2. PostgreSQL Unavailable

```bash
kubectl get deployment postgres -n viktolearn-helm
kubectl get pods -n viktolearn-helm -l app=postgres
kubectl describe deployment postgres -n viktolearn-helm
kubectl get application viktolearn -n argocd
```

ViktoLearn uses Argo CD self-healing. Manual desired-state drift may
therefore be automatically reverted.

## 3. Redis Unavailable

```bash
kubectl get deployment redis -n viktolearn-helm
kubectl get pods -n viktolearn-helm -l app=redis
kubectl describe deployment redis -n viktolearn-helm
kubectl get application viktolearn -n argocd
```

Verify that Redis returns to Ready state.

## 4. CrashLoopBackOff

Find and inspect the affected Pod:

```bash
kubectl get pods -n viktolearn-helm
kubectl describe pod <POD_NAME> -n viktolearn-helm
```

Check logs:

```bash
kubectl logs <POD_NAME> -n viktolearn-helm --tail=100
kubectl logs <POD_NAME> -n viktolearn-helm --previous --tail=100
```

Look for:

- Exit code
- Termination reason
- Restart count
- Kubernetes Events
- Application startup errors

After correcting the root cause:

```bash
kubectl rollout status deployment/<DEPLOYMENT> \
  -n viktolearn-helm --timeout=120s
```

## 5. ImagePullBackOff / Failed Rollout

```bash
kubectl get pods -n viktolearn-helm
kubectl describe pod <POD_NAME> -n viktolearn-helm
```

Check the deployed image:

```bash
kubectl get deployment <DEPLOYMENT> \
  -n viktolearn-helm \
  -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

Typical causes:

- Invalid image tag
- Image does not exist
- Registry authentication problem
- Registry unavailable

ViktoLearn normally deploys immutable Git SHA image tags from GHCR.

After correction:

```bash
kubectl rollout status deployment/<DEPLOYMENT> \
  -n viktolearn-helm --timeout=120s
```

## 6. Missing Environment Configuration

```bash
kubectl get pods -n viktolearn-helm
kubectl describe pod <POD_NAME> -n viktolearn-helm
```

A missing ConfigMap key can produce:

```text
CreateContainerConfigError
```

Inspect configuration:

```bash
kubectl get configmap viktolearn-config \
  -n viktolearn-helm -o yaml
```

If the container never started, application logs may not exist.
Kubernetes Events are the primary diagnostic source.

## 7. Slow API

Kubernetes health alone does not prove acceptable application latency.

Check endpoint latency:

```bash
time curl -s http://127.0.0.1:8000/<ENDPOINT>
```

Use Prometheus to inspect p95 latency:

```promql
histogram_quantile(
  0.95,
  sum by (le) (
    rate(viktolearn_http_request_duration_seconds_bucket[5m])
  )
)
```

For a specific path:

```promql
histogram_quantile(
  0.95,
  sum by (le) (
    rate(
      viktolearn_http_request_duration_seconds_bucket{
        path="/ENDPOINT"
      }[5m]
    )
  )
)
```

Compare latency with request rate, error rate, CPU, memory, and logs.

## Recovery Verification

After every incident:

```bash
kubectl get pods -n viktolearn-helm
kubectl get application viktolearn -n argocd
git status
```

Confirm:

- Workloads are Ready
- Argo CD is Synced / Healthy
- Correct immutable image is deployed
- Application health endpoint succeeds
- Git working tree is clean
