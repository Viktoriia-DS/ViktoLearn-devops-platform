from fastapi import APIRouter

from app.routes.courses import courses
from app.routes.enrollments import enrollments
from app.routes.progress import progress_records
from app.routes.students import students

router = APIRouter()

router.get("/admin/dashboard")


def admin_dashboard():
    total_courses = len(courses)
    total_students = len(students)
    total_enrollments = len(enrollments)
    completed_courses = len(
        [record for record in progress_records if record["status"] == "completed"]
    )

    return {
        "total_courses": total_courses,
        "total_students": total_students,
        "total_enrollments": total_enrollments,
        "completed_courses": completed_courses,
        "service_status": "operational",
    }
