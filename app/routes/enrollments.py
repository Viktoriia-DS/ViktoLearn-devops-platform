from fastapi import APIRouter

router = APIRouter()

enrollments = [
    {
        "id": 1,
        "student_id": 1,
        "course_id": 1,
    },
    {
        "id": 2,
        "student_id": 1,
        "course_id": 2,
    },
    {
        "id": 3,
        "student_id": 2,
        "course_id": 3,
    },
    {
        "id": 4,
        "student_id": 3,
        "course_id": 3,
    },
]


@router.get("/enrollments")
def get_enrollments():
    return enrollments
