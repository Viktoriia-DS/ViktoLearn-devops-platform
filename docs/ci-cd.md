# CI/CD Pipeline

ViktoLearn uses GitHub Actions for continuous integration, container validation, image publishing, and GitOps delivery.

The pipeline is defined in `.github/workflows/ci.yml`.

## Pipeline Flow

```text
Code Push
    |
    v
GitHub Actions
    |
    +--> Code quality and tests
    +--> Dockerfile validation
    +--> Container build and security scan
    +--> Helm and Kubernetes validation
    |
    v
GHCR image with immutable Git SHA tag
    |
    v
Update Helm image tag in Git
    |
    v
Argo CD detects Git change
    |
    v
Kubernetes reconciliation
```

The container image is promoted only after the validation stages succeed.

## Validation Stages

### Application Quality

- Ruff performs Python linting.
- Black verifies formatting.
- pytest executes the automated test suite.

### Container Quality and Security

- Hadolint validates Dockerfile practices.
- Docker builds the application image once for validation.
- Trivy scans the built image and fails the pipeline on fixable HIGH or CRITICAL vulnerabilities.

### Helm and Kubernetes Validation

- `helm lint` validates the Helm chart.
- `helm template` renders the Kubernetes resources used for further validation.
- `scripts/validate-kubernetes.py` checks rendered security configuration, including valid seccomp profile types.
- kube-linter performs static Kubernetes manifest analysis.
- kube-score performs additional workload configuration checks.

## Image Publishing

For pushes to `main`, the validated image is published to GitHub Container Registry:

```text
ghcr.io/viktoriia-ds/viktolearn-devops-platform
```

Images use the Git commit SHA as an immutable deployment tag. The pipeline also publishes `latest`, while Kubernetes deployment uses the immutable SHA tag.

Pull requests run validation and build/security checks but do not publish deployment images.

## GitOps Delivery

After a successful image publication on `main`, GitHub Actions updates the image tag in `helm/viktolearn/values.yaml`.

The workflow commits that change back to Git using a commit message containing `[skip ci]`. This prevents the automated GitOps commit from recursively starting another pipeline.

Argo CD tracks the `main` branch and the `helm/viktolearn` path. Once the image-tag commit appears in Git, Argo CD automatically reconciles the desired state into the `viktolearn-helm` namespace.

Automated synchronization uses both pruning and self-healing.

## Pipeline Design Decisions

### Build Once

The Docker image is built before the security gate and the same validated image is subsequently tagged and published. This avoids rebuilding a different artifact after validation.

### Immutable Deployment Tags

Git SHA image tags make the deployed application version traceable back to an exact source revision.

### Git as Desired State

CI does not directly modify the Kubernetes application deployment. It changes the desired Helm configuration in Git, and Argo CD performs reconciliation.

This separates CI artifact production from GitOps deployment responsibility.

### Security Gates

Container, Dockerfile, Helm, and Kubernetes checks run before image publication. A failed required validation stage prevents the delivery portion of the workflow from proceeding.

## Portfolio Evidence

The successful pipeline is captured in `docs/screenshots/02-github-actions.png`.
