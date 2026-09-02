# Cloud Deployment: AWS and GCP

ViktoLearn is implemented and validated as a local-first Kubernetes platform. It has not been deployed to AWS or Google Cloud.

The architecture intentionally uses Kubernetes and cloud-native components that can be mapped to managed cloud services.

## Architecture Mapping

| Local ViktoLearn Component | AWS Equivalent | GCP Equivalent |
| --- | --- | --- |
| Kind Kubernetes | Amazon EKS | Google Kubernetes Engine (GKE) |
| PostgreSQL container | Amazon RDS for PostgreSQL | Cloud SQL for PostgreSQL |
| Redis container | Amazon ElastiCache for Redis | Memorystore for Redis |
| GHCR | Amazon ECR or GHCR | Artifact Registry or GHCR |
| MetalLB | AWS Load Balancer integration | Google Cloud Load Balancing |
| PersistentVolume | Amazon EBS | Compute Engine Persistent Disk |
| Kubernetes Secrets | AWS Secrets Manager integration | Secret Manager integration |
| Prometheus/Grafana | Amazon Managed Service for Prometheus / Amazon Managed Grafana | Managed Service for Prometheus / Grafana deployment |
| Loki logs | Loki or CloudWatch | Loki or Cloud Logging |

## Kubernetes Layer

The ViktoLearn Helm chart would remain the primary application packaging mechanism.

Instead of creating a local Kind cluster, infrastructure provisioning would create an EKS or GKE cluster and configure the required Kubernetes controllers, storage classes, ingress or Gateway implementation, monitoring integration, and workload identity.

Argo CD could continue to reconcile the same Git repository and Helm chart into the managed Kubernetes cluster.

## AWS Deployment Model

An AWS implementation could use:

- Amazon EKS for the Kubernetes control plane and worker nodes;
- Amazon RDS for PostgreSQL instead of running the database inside the application cluster;
- Amazon ElastiCache for Redis instead of the in-cluster Redis Deployment;
- Amazon ECR or the existing GHCR workflow for container images;
- Elastic Load Balancing integrated with Kubernetes for external traffic;
- Amazon EBS-backed persistent volumes where Kubernetes storage is required;
- AWS Secrets Manager for application credentials;
- EKS Pod Identity or IAM Roles for Service Accounts (IRSA) for AWS API access;
- Amazon Managed Service for Prometheus and Amazon Managed Grafana, or the existing self-managed observability stack.

The FastAPI workload would remain containerized and deployed through Helm.

Production PostgreSQL and Redis would preferably move outside the application cluster to managed services, reducing database and cache operational responsibility.

## GCP Deployment Model

A Google Cloud implementation could use:

- Google Kubernetes Engine for Kubernetes;
- Cloud SQL for PostgreSQL;
- Memorystore for Redis;
- Artifact Registry or the existing GHCR workflow for container images;
- Google Cloud Load Balancing integrated with Kubernetes;
- Persistent Disk-backed Kubernetes storage;
- Secret Manager for application credentials;
- Workload Identity Federation for GKE for access to Google Cloud services;
- Google Cloud Managed Service for Prometheus with Grafana, or the existing observability stack.

As with AWS, the FastAPI application and Helm deployment model could remain largely unchanged while stateful infrastructure moves to managed services.

## CI/CD and GitOps

The current separation between CI and deployment can remain in both clouds.

GitHub Actions would continue to test, build, scan, and publish immutable container images. It would then update the Helm image tag in Git.

Argo CD running against EKS or GKE would detect that desired-state change and perform Kubernetes reconciliation.

Cloud authentication should use short-lived identity federation or workload identity rather than long-lived cloud credentials stored in the repository.

## Portability

The local-first design keeps the application layer portable because the core deployment is based on Docker, Kubernetes, Helm, GitOps, Prometheus-compatible metrics, and centralized container logs.

Cloud-specific infrastructure would primarily affect cluster provisioning, managed databases, managed cache, load balancing, storage, identity, secrets, and observability integrations.

This document describes the intended production evolution of ViktoLearn; it does not claim that the current portfolio environment has been deployed to either cloud provider.
