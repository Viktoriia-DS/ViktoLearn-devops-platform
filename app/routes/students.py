from fastapi import APIRouter
router = APIRouter()
students = [
    {
        "id": 1,
        "name": "Ana García",
        "email": "ana@example.com",
    },
    {
        "id": 2,
        "name": "Ivan Petrov",
        "email": "ivan@example.com",
    },
    {
        "id": 3,
        "name": "Marta López",
        "email": "marta@example.com"
    }
]

@router.get("/students")
def get_students():
    return students