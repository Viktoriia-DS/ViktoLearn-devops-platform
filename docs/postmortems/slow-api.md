# Postmortem: Slow API Response

## Summary

A controlled performance incident was introduced into ViktoLearn to test
the platform's ability to detect application latency while Kubernetes
continued to report the workload as healthy.

A temporary `/slow` endpoint introduced an intentional delay of
approximately 3 seconds per request.

The incident demonstrated that Kubernetes workload health and application
performance are separate operational signals.

## Impact

The simulated `/slow` endpoint remained available and returned HTTP 200,
but requests took approximately 3 seconds.

Other application endpoints, including `/health`, continued operating
normally.

No PostgreSQL or Redis outage occurred.

## Detection

Direct measurements showed:

```text
/health: approximately 0.027 seconds
/slow:   approximately 3.026 seconds
```

The application Prometheus histogram recorded five completed slow
requests:

```text
viktolearn_http_request_duration_seconds_count{method="GET",path="/slow"} 5
viktolearn_http_request_duration_seconds_sum{method="GET",path="/slow"} 15.014...
```

This corresponds to an average observed latency of approximately
3.003 seconds.

Prometheus p95 queries also showed a significant difference between
the normal and slow endpoints.

Observed values:

```text
/health p95: approximately 0.00475 seconds
/slow p95:   approximately 4.875 seconds
```

The `/slow` p95 estimate is higher than the actual 3-second delay because
Prometheus calculates histogram quantiles by interpolating between
histogram bucket boundaries.

## Kubernetes State During Incident

The API remained operational from Kubernetes' perspective:

- Pod was Running
- Container was Ready
- Deployment was available
- Argo CD remained Synced / Healthy
- `/health` continued returning HTTP 200

Therefore, Kubernetes workload health alone did not detect the
application performance degradation.

## Root Cause

The latency was intentionally introduced with:

```python
await asyncio.sleep(3)
```

inside a temporary `/slow` FastAPI endpoint.

This simulated an application operation that takes significantly longer
than normal while still completing successfully.

## Resolution

The temporary slow endpoint and its router registration were removed.

The change was committed and pushed through the normal delivery process:

```text
Git
  -> GitHub Actions CI
  -> GHCR immutable image
  -> GitOps Helm image update
  -> Argo CD
  -> Kubernetes rollout
```

The recovery image used the immutable Git SHA:

```text
d7b5417a27f5b22cd167dee58bc1ecedf0096c54
```

The Kubernetes rollout completed successfully.

## Recovery Verification

After deployment:

```text
GET /health -> HTTP 200 OK
GET /slow   -> HTTP 404 Not Found
```

The 404 response for `/slow` confirmed that the artificial incident
endpoint was no longer present.

The normal `/health` endpoint confirmed that the API remained healthy.

## What Worked

- Prometheus application latency instrumentation captured the incident.
- Histogram metrics allowed endpoint-specific latency analysis.
- Kubernetes continued maintaining workload availability.
- Argo CD maintained the desired deployment state.
- CI/CD produced and deployed an immutable recovery image.
- Direct HTTP testing confirmed recovery.

## Lessons Learned

### Kubernetes health is not application performance

A Pod can be Running and Ready while users experience unacceptable
latency.

### Application-level metrics are required

Request-duration metrics provide visibility that Kubernetes status alone
cannot provide.

### Endpoint-level labels improve diagnosis

The `path` label on ViktoLearn HTTP metrics allowed `/slow` to be compared
directly with `/health`.

### Histogram quantiles are estimates

Prometheus histogram quantiles depend on bucket boundaries and should not
be interpreted as exact measurements of individual requests.

## Follow-up Actions

- Maintain request-duration instrumentation.
- Monitor p95 API latency in Grafana.
- Keep error-rate and availability alerts enabled.
- Consider adding a dedicated high-latency Prometheus alert.
- Consider defining latency SLOs for production environments.
- Keep incident-response procedures under version control.
