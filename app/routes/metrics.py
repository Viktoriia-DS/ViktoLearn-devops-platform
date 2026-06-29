from fastapi import APIRouter
router = APIRouter()

@router.get("/metrics")
def metrics():
    return {
        "requests_total": 0,
        "error_total": 0,
        "uptime_seconds": 0
    }
