# ViktoLearn DevOps Platform

ViktoLearn is a DevOps capstone project built with FastAPI, Docker, Kubernetes, Helm, Argo CD, Prometheus, Grafana, and PostgreSQL.

## Features

- FastAPI REST API
- Health and readiness endpoints
- Metrics endpoint
- Courses management
- Students management
- Enrollments
- Progress tracking
- Admin dashboard
- Automated tests with pytest

## Endpoints

| Endpoint | Description |
|------------|------------|
| `/` | Root endpoint |
| `/health` | Health check |
| `/ready` | Readiness check |
| `/metrics` | Metrics endpoint |
| `/courses` | List courses |
| `/students`| List students |
| `/enrollments`| List enrollments |
| `/progress`| List progress records |
| `/admin/dashboard`| Platform dashboard |

## Running locally 

Create virtual environment:

````bash
python3 -m venv .venv
source .venv/bin/activate
```
Install dependencies:

````bash
pip install -r requirements.txt

Run the API:

```bash
uvicorn app.main:app --reload
```

Open:

- http://127.0.0.1:8000/docs
- http://127.0.0.1:8000/redoc

Run tests:

```bash
pytest
```

## Tech stack

- Python
- FastAPI
- Pytest
- Docker
- Kubernetes
- Helm
- Argo CD
- Prometheus
- Grafana
- PostgreSQL
- Redis

## Project status

Phase 1: App Foundation (almost complete)
