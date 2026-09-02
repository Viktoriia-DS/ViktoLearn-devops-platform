import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.monitoring import PrometheusMiddleware
from app.routes.admin import router as admin_router
from app.routes.courses import router as courses_router
from app.routes.enrollments import router as enrollments_router
from app.routes.health import router as health_router
from app.routes.metrics import router as metrics_router
from app.routes.progress import router as progress_router
from app.routes.students import router as students_router

app = FastAPI(
    title="ViktoLearn API",
    description="Learning platform API for the ViktoLearn DevOps capstone project",
    version="0.1.0",
)

app.add_middleware(PrometheusMiddleware)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

app.include_router(health_router)
app.include_router(courses_router)
app.include_router(students_router)
app.include_router(enrollments_router)
app.include_router(progress_router)
app.include_router(admin_router)
app.include_router(metrics_router)
if os.getenv("ENABLE_REDIS", "true").lower() == "true":
    from app.routes import cache

    app.include_router(cache.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to ViktoLearn",
        "status": "running",
    }
