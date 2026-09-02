# Incident Response

ViktoLearn includes an incident-response workflow designed to demonstrate detection, diagnosis, recovery, and post-incident analysis in a Kubernetes environment.

## Incident Response Process

The operational workflow follows these stages:

1. Detect the problem through metrics, alerts, logs, or Kubernetes workload state.
2. Assess the affected component and user impact.
3. Inspect Kubernetes resources, application logs, events, and observability data.
4. Mitigate or restore the affected service.
5. Verify application health after recovery.
6. Document the incident, root cause, and preventive actions.

## Failure Scenarios Tested

Controlled failure exercises were performed for:

- broken application endpoint;
- PostgreSQL unavailability;
- Redis unavailability;
- CrashLoopBackOff;
- invalid container image;
- missing configuration;
- elevated API latency.

These exercises were performed in the local Kubernetes environment and returned to a healthy state after testing.

## Detection and Diagnosis

The platform provides several diagnostic layers:

- Prometheus metrics and alert rules for availability, errors, and latency;
- Grafana dashboards for application and Kubernetes metrics;
- Loki centralized logs collected by Grafana Alloy;
- Kubernetes pod status, events, logs, and rollout state;
- Argo CD synchronization and health information.

Using these signals together makes it possible to correlate application symptoms with Kubernetes and infrastructure state.

## GitOps Recovery

Argo CD self-healing was tested during dependency failure exercises.

For example, PostgreSQL and Redis Deployments were deliberately scaled down. Because their desired replica state remained defined in Git/Helm, Argo CD detected the drift and restored the workloads.

This demonstrates why manual cluster state is not treated as the authoritative deployment configuration.

## Incident Runbook

The operational runbook is maintained at:

`docs/runbooks/incident-response.md`

It provides commands and investigation procedures for common application and Kubernetes failure scenarios.

## Postmortem Exercise

A controlled slow-API incident was used as the postmortem exercise.

A temporary endpoint introduced approximately three seconds of application latency. Prometheus request-duration metrics exposed the increased latency and the high-latency alert was validated.

After the test, the temporary slow endpoint was removed and normal application behavior was restored.

The postmortem is maintained at:

`docs/postmortems/slow-api.md`

The exercise demonstrates the full operational cycle from fault introduction and detection through investigation, recovery, and documentation.

## Related Observability

Monitoring and logging architecture is documented in `docs/monitoring-logging.md`.

Portfolio screenshots of Grafana metrics and centralized logs are available under `docs/screenshots/`.
