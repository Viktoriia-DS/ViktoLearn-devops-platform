from fastapi import APIRouter
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
        "category": "Containers"
    },
    {
        "id": 3,
        "title": "Kubernetes Basics",
        "category": "Kubernetes"
    }
]

@router.get("/courses")
def get_courses():
    return courses