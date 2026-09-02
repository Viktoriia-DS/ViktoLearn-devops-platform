import { useEffect, useState } from 'react'
import './App.css'

type Course = {
  id: number
  title: string
  category: string
}

type Student = {
  id: number
  name: string
  email: string
}

type Enrollment = {
  id: number
  student_id: number
  course_id: number
}

type Progress = {
  id: number
  student_id: number
  course_id: number
  progress_percent: number
  status: string
}

type AdminData = {
  total_courses: number
  total_students: number
  total_enrollments: number
  completed_courses: number
  service_status: string
}

type View = 'home' | 'dashboard' | 'admin'

function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseLoading, setCourseLoading] = useState(false)
  const [view, setView] = useState<View>('home')
  const [students, setStudents] = useState<Student[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState('')
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')

  async function openCourse(courseId: number) {
    setCourseLoading(true)

    try {
      const response = await fetch(`/api/courses/${courseId}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: Course = await response.json()
      setSelectedCourse(data)
    } catch (error) {
      console.error('Failed to load course:', error)
    } finally {
      setCourseLoading(false)
    }
  }

  async function openAdmin() {
    setSelectedCourse(null)
    setView('admin')
    setAdminLoading(true)
    setAdminError('')

    try {
      const response = await fetch('/api/admin/dashboard')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: AdminData = await response.json()
      setAdminData(data)
    } catch (error) {
      console.error('Failed to load admin dashboard:', error)
      setAdminError('Admin data is temporarily unavailable.')
    } finally {
      setAdminLoading(false)
    }
  }

  async function openDashboard() {
    setSelectedCourse(null)
    setView('dashboard')
    setDashboardLoading(true)
    setDashboardError('')

    try {
      const [studentsResponse, enrollmentsResponse, progressResponse] =
        await Promise.all([
          fetch('/api/students'),
          fetch('/api/enrollments'),
          fetch('/api/progress'),
        ])

      if (
        !studentsResponse.ok ||
        !enrollmentsResponse.ok ||
        !progressResponse.ok
      ) {
        throw new Error('Dashboard request failed')
      }

      const studentsData: Student[] = await studentsResponse.json()
      const enrollmentsData: Enrollment[] = await enrollmentsResponse.json()
      const progressData: Progress[] = await progressResponse.json()

      setStudents(studentsData)
      setEnrollments(enrollmentsData)
      setProgress(progressData)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      setDashboardError('Dashboard data is temporarily unavailable.')
    } finally {
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch('/api/courses')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data: Course[] = await response.json()
        setCourses(data)
      } catch (error) {
        console.error('Failed to load courses:', error)
        setCoursesError('Courses are temporarily unavailable.')
      } finally {
        setCoursesLoading(false)
      }
    }

    loadCourses()
  }, [])

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-mark">V</span>
          <span>ViktoLearn</span>
        </a>

        <nav>
          <a href="#courses">Courses</a>
          <a href="#platform">Platform</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <button className="login-button" onClick={openDashboard}>
            Dashboard
          </button>
          <button className="login-button" onClick={openAdmin}>
            Admin
          </button>
          <button className="primary-button">Get started</button>
        </div>
      </header>

      <main>
        {view === 'admin' ? (
          <section className="admin-dashboard">
            <div className="dashboard-topbar">
              <div>
                <span className="eyebrow">ADMIN DASHBOARD</span>
                <h1>Platform overview</h1>
                <p>
                  Monitor learning activity and the current state of ViktoLearn.
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={() => setView('home')}
              >
                ← Back to home
              </button>
            </div>

            {adminLoading && (
              <p className="courses-message">Loading platform data...</p>
            )}

            {adminError && (
              <p className="courses-message error">{adminError}</p>
            )}

            {!adminLoading && !adminError && adminData && (
              <>
                <div className="admin-status">
                  <div>
                    <span className="status-indicator" />
                    <div>
                      <span>Platform status</span>
                      <strong>{adminData.service_status}</strong>
                    </div>
                  </div>

                  <span>ViktoLearn API</span>
                </div>

                <div className="admin-metrics">
                  <article>
                    <span>Total courses</span>
                    <strong>{adminData.total_courses}</strong>
                    <p>Courses available on the learning platform.</p>
                  </article>

                  <article>
                    <span>Total students</span>
                    <strong>{adminData.total_students}</strong>
                    <p>Students currently registered with ViktoLearn.</p>
                  </article>

                  <article>
                    <span>Total enrollments</span>
                    <strong>{adminData.total_enrollments}</strong>
                    <p>Active course enrollment records.</p>
                  </article>

                  <article>
                    <span>Completed courses</span>
                    <strong>{adminData.completed_courses}</strong>
                    <p>Course completions recorded by the platform.</p>
                  </article>
                </div>

                <div className="admin-summary">
                  <div>
                    <span className="eyebrow">PLATFORM ACTIVITY</span>
                    <h2>Learning at a glance</h2>
                  </div>

                  <div className="admin-summary-grid">
                    <div>
                      <span>Students per course</span>
                      <strong>
                        {adminData.total_courses > 0
                          ? (
                              adminData.total_students /
                              adminData.total_courses
                            ).toFixed(1)
                          : '0'}
                      </strong>
                    </div>

                    <div>
                      <span>Enrollments per student</span>
                      <strong>
                        {adminData.total_students > 0
                          ? (
                              adminData.total_enrollments /
                              adminData.total_students
                            ).toFixed(1)
                          : '0'}
                      </strong>
                    </div>

                    <div>
                      <span>Completion rate</span>
                      <strong>
                        {adminData.total_enrollments > 0
                          ? `${Math.round(
                              (adminData.completed_courses /
                                adminData.total_enrollments) *
                                100,
                            )}%`
                          : '0%'}
                      </strong>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        ) : view === 'dashboard' ? (
          <section className="dashboard">
            <div className="dashboard-topbar">
              <div>
                <span className="eyebrow">STUDENT DASHBOARD</span>
                <h1>
                  {students[0] ? `Welcome back, ${students[0].name}` : 'Your learning'}
                </h1>
                <p>Track your courses and continue your learning progress.</p>
              </div>

              <button
                className="secondary-button"
                onClick={() => setView('home')}
              >
                ← Back to home
              </button>
            </div>

            {dashboardLoading && (
              <p className="courses-message">Loading dashboard...</p>
            )}

            {dashboardError && (
              <p className="courses-message error">{dashboardError}</p>
            )}

            {!dashboardLoading && !dashboardError && students[0] && (
              <>
                <div className="dashboard-stats">
                  <div className="dashboard-stat">
                    <span>Enrolled courses</span>
                    <strong>
                      {
                        enrollments.filter(
                          (enrollment) =>
                            enrollment.student_id === students[0].id,
                        ).length
                      }
                    </strong>
                  </div>

                  <div className="dashboard-stat">
                    <span>Average progress</span>
                    <strong>
                      {(() => {
                        const studentProgress = progress.filter(
                          (item) => item.student_id === students[0].id,
                        )

                        if (studentProgress.length === 0) return '0%'

                        const average =
                          studentProgress.reduce(
                            (total, item) => total + item.progress_percent,
                            0,
                          ) / studentProgress.length

                        return `${Math.round(average)}%`
                      })()}
                    </strong>
                  </div>

                  <div className="dashboard-stat">
                    <span>Completed</span>
                    <strong>
                      {
                        progress.filter(
                          (item) =>
                            item.student_id === students[0].id &&
                            item.status === 'completed',
                        ).length
                      }
                    </strong>
                  </div>
                </div>

                <div className="dashboard-content">
                  <div className="dashboard-heading">
                    <div>
                      <span className="eyebrow">MY LEARNING</span>
                      <h2>Courses in progress</h2>
                    </div>

                    <span className="student-email">{students[0].email}</span>
                  </div>

                  <div className="dashboard-course-list">
                    {progress
                      .filter((item) => item.student_id === students[0].id)
                      .map((item) => {
                        const course = courses.find(
                          (candidate) => candidate.id === item.course_id,
                        )

                        if (!course) return null

                        return (
                          <article
                            className="dashboard-course-card"
                            key={item.id}
                          >
                            <div className="dashboard-course-number">
                              {String(course.id).padStart(2, '0')}
                            </div>

                            <div className="dashboard-course-info">
                              <span className="level">{course.category}</span>
                              <h3>{course.title}</h3>

                              <div className="dashboard-progress-row">
                                <div className="dashboard-progress-track">
                                  <div
                                    className="dashboard-progress-value"
                                    style={{
                                      width: `${item.progress_percent}%`,
                                    }}
                                  />
                                </div>

                                <strong>{item.progress_percent}%</strong>
                              </div>
                            </div>

                            <button
                              className="secondary-button"
                              onClick={() => {
                                setView('home')
                                openCourse(course.id)
                              }}
                            >
                              Continue →
                            </button>
                          </article>
                        )
                      })}
                  </div>
                </div>
              </>
            )}
          </section>
        ) : selectedCourse ? (
          <section className="course-detail">
            <button
              className="back-button"
              onClick={() => setSelectedCourse(null)}
            >
              ← Back to courses
            </button>

            <div className="course-detail-layout">
              <div className="course-detail-main">
                <span className="eyebrow">{selectedCourse.category}</span>

                <h1>{selectedCourse.title}</h1>

                <p className="course-detail-intro">
                  Build practical knowledge through focused lessons,
                  exercises, and hands-on learning.
                </p>

                <div className="course-overview">
                  <h2>Course overview</h2>
                  <p>
                    This course introduces the core concepts and practical
                    skills you need to work confidently with{' '}
                    {selectedCourse.title}.
                  </p>
                </div>

                <div className="course-modules">
                  <h2>What you'll learn</h2>

                  <div className="module-item">
                    <span>01</span>
                    <div>
                      <h3>Core concepts</h3>
                      <p>Understand the essential principles and terminology.</p>
                    </div>
                  </div>

                  <div className="module-item">
                    <span>02</span>
                    <div>
                      <h3>Practical workflow</h3>
                      <p>Apply the concepts through realistic technical tasks.</p>
                    </div>
                  </div>

                  <div className="module-item">
                    <span>03</span>
                    <div>
                      <h3>Hands-on practice</h3>
                      <p>Build confidence by working through practical examples.</p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="course-sidebar">
                <span className="course-sidebar-label">COURSE</span>
                <h3>{selectedCourse.title}</h3>

                <div className="course-meta">
                  <div>
                    <span>Category</span>
                    <strong>{selectedCourse.category}</strong>
                  </div>
                  <div>
                    <span>Course ID</span>
                    <strong>#{selectedCourse.id}</strong>
                  </div>
                  <div>
                    <span>Format</span>
                    <strong>Self-paced</strong>
                  </div>
                </div>

                <button className="primary-button course-start-button">
                  Start course
                </button>
              </aside>
            </div>
          </section>
        ) : (
          <>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">LEARN. BUILD. PROGRESS.</span>

            <h1>
              Build skills that
              <span> move you forward.</span>
            </h1>

            <p className="hero-description">
              Practical technology courses designed to turn knowledge into
              real-world skills. Learn at your own pace and track your progress
              as you grow.
            </p>

            <div className="hero-actions">
              <a className="primary-button large" href="#courses">
                Explore courses
              </a>
              <a className="secondary-button large" href="#platform">
                How it works
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>3+</strong>
                <span>Learning paths</span>
              </div>
              <div>
                <strong>50+</strong>
                <span>Practical lessons</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Self-paced</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <span>Your learning</span>
              <span className="status">In progress</span>
            </div>

            <div className="current-course">
              <span className="course-icon">K8s</span>
              <div>
                <small>CURRENT COURSE</small>
                <h3>Docker & Kubernetes</h3>
                <p>12 of 24 lessons completed</p>
              </div>
            </div>

            <div className="progress-track">
              <div className="progress-value" />
            </div>

            <div className="progress-label">
              <span>Course progress</span>
              <strong>50%</strong>
            </div>

            <div className="next-lesson">
              <small>UP NEXT</small>
              <strong>Kubernetes Deployments</strong>
              <span>Continue →</span>
            </div>
          </div>
        </section>

        <section className="courses-section" id="courses">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FEATURED COURSES</span>
              <h2>Start learning today</h2>
            </div>

            <p>
              Structured learning paths built around practical skills and
              real-world technologies.
            </p>
          </div>

          <div className="course-grid">
            {coursesLoading && (
              <p className="courses-message">Loading courses...</p>
            )}

            {coursesError && (
              <p className="courses-message error">{coursesError}</p>
            )}

            {!coursesLoading &&
              !coursesError &&
              courses.map((course, index) => (
                <article className="course-card" key={course.id}>
                  <div className={`course-visual visual-${(index % 3) + 1}`}>
                    <span>{String(course.id).padStart(2, '0')}</span>
                  </div>

                  <div className="course-body">
                    <span className="level">{course.category}</span>
                    <h3>{course.title}</h3>
                    <p>
                      Explore practical concepts and skills in {course.title}.
                    </p>

                    <div className="course-footer">
                      <span>Course #{course.id}</span>
                      <button onClick={() => openCourse(course.id)}>View course →</button>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </section>

        <section className="platform-section" id="platform">
          <span className="eyebrow">THE PLATFORM</span>
          <h2>Everything you need to keep progressing.</h2>

          <div className="feature-grid">
            <div>
              <span className="feature-number">01</span>
              <h3>Practical courses</h3>
              <p>Learn through focused lessons built around useful technical skills.</p>
            </div>

            <div>
              <span className="feature-number">02</span>
              <h3>Track progress</h3>
              <p>See completed lessons and continue exactly where you stopped.</p>
            </div>

            <div>
              <span className="feature-number">03</span>
              <h3>Learn at your pace</h3>
              <p>Move through each learning path according to your own schedule.</p>
            </div>
          </div>
        </section>
          </>
        )}

        {courseLoading && (
          <div className="course-loading-overlay">
            <span>Loading course...</span>
          </div>
        )}
      </main>

      <footer id="about">
        <a className="brand" href="#">
          <span className="brand-mark">V</span>
          <span>ViktoLearn</span>
        </a>

        <p>Practical learning for modern technology.</p>
      </footer>
    </div>
  )
}

export default App
