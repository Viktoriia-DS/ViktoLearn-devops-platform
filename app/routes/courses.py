from fastapi import APIRouter, HTTPException

router = APIRouter()

courses = [
    {
        "id": 1,
        "title": "Introduction to DevOps",
        "category": "DevOps",
    },
    {
        "id": 2,
        "title": "Docker Fundamentals",
        "category": "Containers",
    },
    {
        "id": 3,
        "title": "Kubernetes Basics",
        "category": "Kubernetes",
    },
]


@router.get("/courses")
def get_courses():
    return courses


@router.get("/courses/{course_id}")
def get_course(course_id: int):
    for course in courses:
        if course["id"] == course_id:
            return course

    raise HTTPException(status_code=404, detail="Course not found")
