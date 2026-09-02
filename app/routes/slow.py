import asyncio

from fastapi import APIRouter

router = APIRouter()


@router.get("/slow")
async def slow_endpoint():
    await asyncio.sleep(3)
    return {"status": "ok", "delay_seconds": 3}
