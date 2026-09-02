# Monitoring and Logging

ViktoLearn uses Prometheus and Grafana for metrics and Loki with Grafana Alloy for centralized Kubernetes logging.

## Observability Architecture

```text
FastAPI /metrics
       |
       v
ServiceMonitor
       |
       v
Prometheus <------ Kubernetes metrics
       |
       v
Grafana Monitoring Dashboard

Kubernetes Pod Logs
       |
       v
Grafana Alloy
       |
       v
Loki
       |
       v
Grafana Logs Dashboard
```

The monitoring stack runs in the `monitoring` namespace.

## Application Metrics

FastAPI exposes Prometheus metrics through `/metrics`.

The application middleware records:

- HTTP request count by method, path, and status code;
- HTTP request duration;
- HTTP error count for responses with status codes of 400 or higher.

## Prometheus

A ServiceMonitor named `viktolearn-api` allows Prometheus to discover and scrape the API service in the `viktolearn-helm` namespace.

The application metrics target was validated with the API target in the UP state.

PrometheusRule resources define application alerts for:

- API availability;
- elevated HTTP error rate;
- high p95 request latency.

Alert behavior was tested with controlled failure conditions before returning the platform to its healthy state.

## Grafana Monitoring

The `ViktoLearn Monitoring` dashboard provides seven operational views:

1. Request rate
2. Error rate
3. p95 request latency
4. API CPU usage
5. API memory usage
6. Pod restarts
7. Available API replicas

The dashboard is stored as JSON in `monitoring/grafana/dashboards/viktolearn-monitoring.json` and provisioned through Kubernetes configuration.

Portfolio evidence is available in `docs/screenshots/04-grafana-monitoring.png`.

## Centralized Logging

Grafana Alloy discovers Kubernetes pods and collects their logs.

Log records are labeled with Kubernetes metadata including namespace, pod, and container before being forwarded to Loki.

Loki provides centralized log storage and query capabilities.

Grafana uses Loki as a datasource for log exploration and dashboards.

## ViktoLearn Logs Dashboard

The provisioned `ViktoLearn Logs` dashboard contains:

- API Logs — application logs from the FastAPI container;
- Error Logs — log entries matching HTTP 4xx and 5xx responses.

The logging pipeline was validated by generating controlled HTTP 404 requests and confirming that they appeared in the Error Logs panel.

The dashboard configuration is stored in `monitoring/grafana/dashboards/viktolearn-logs.json`.

Portfolio evidence is available in `docs/screenshots/05-grafana-logs.png`.

## Observability as Code

ViktoLearn keeps observability configuration in the repository rather than relying only on manually configured dashboards.

Version-controlled configuration includes:

- Prometheus ServiceMonitor;
- Prometheus alert rules;
- Loki configuration;
- Grafana Alloy configuration;
- Grafana datasource configuration;
- Grafana metrics dashboard;
- Grafana logs dashboard.

This makes the observability configuration reproducible and reviewable alongside the application infrastructure.

## Operational Use

Metrics provide numerical signals for availability, traffic, latency, resource consumption, and failures.

Centralized logs provide request-level evidence for investigating application behavior and incidents.

Together, Prometheus, Grafana, Alloy, and Loki provide the telemetry used by the ViktoLearn incident-response workflow.
