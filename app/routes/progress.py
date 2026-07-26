from fastapi import APIRouter

router = APIRouter()
progress_records = [
    {
        "id": 1,
        "student_id": 1,
        "course_id": 1,
        "progress_percent": 75,
        "status": "in_progress",
    },
    {
        "id": 2,
        "student_id": 1,
        "course_id": 2,
        "progress_percent": 30,
        "status": "in_progrss",
    },
    {
        "id": 3,
        "student_id": 2,
        "course_id": 3,
        "progress_percent": 100,
        "status": "completed",
    },
]


@router.get("/progress")
def get_progress():
    return progress_records
