from fastapi import APIRouter

from app.redis_client import client

router = APIRouter(
    prefix="/cache",
    tags=["Cache"],
)


@router.get("/")
def cache_health():
    return {
        "status": "healthy",
        "redis": client.ping(),
    }


@router.get("/demo")
def cache_demo():
    client.set("message", "Hello from FastAPI!")

    return {
        "message": client.get("message"),
    }
