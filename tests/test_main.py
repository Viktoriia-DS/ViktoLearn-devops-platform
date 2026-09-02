from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_ready():
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


def test_courses():
    response = client.get("/courses")
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_students():
    response = client.get("/students")
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_get_course():
    response = client.get("/courses/1")
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "title": "Introduction to DevOps",
        "category": "DevOps",
    }


def test_get_course_not_found():
    response = client.get("/courses/999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found"}
