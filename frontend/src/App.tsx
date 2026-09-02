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

  function navigateToSection(sectionId: string) {
    setSelectedCourse(null)
    setView('home')

    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
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
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view, selectedCourse])

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
        <a
          className="brand"
          href="#"
          onClick={() => {
            setSelectedCourse(null)
            setView('home')
          }}
        >
          <span className="brand-mark">V</span>
          <span className="brand-copy">
            <strong>ViktoLearn</strong>
            <small>Engineering Platform</small>
          </span>
        </a>

        <nav>
          <a
            href="#courses"
            onClick={(event) => {
              event.preventDefault()
              navigateToSection('courses')
            }}
          >
            Courses
          </a>
          <a
            href="#platform"
            onClick={(event) => {
              event.preventDefault()
              navigateToSection('platform')
            }}
          >
            Platform
          </a>
          <a
            href="#architecture"
            onClick={(event) => {
              event.preventDefault()
              navigateToSection('architecture')
            }}
          >
            Architecture
          </a>
        </nav>

        <div className="nav-actions">
          <button className="login-button" onClick={openDashboard}>
            Student
          </button>
          <button className="primary-button nav-admin" onClick={openAdmin}>
            Admin Dashboard
          </button>
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
                  <div className="admin-status-primary">
                    <span className="status-indicator" />
                    <div>
                      <span>Platform status</span>
                      <strong>{adminData.service_status}</strong>
                    </div>
                  </div>

                  <div className="admin-status-meta">
                    <span>ViktoLearn API</span>
                    <strong>Service healthy</strong>
                  </div>
                </div>

                <div className="admin-metrics">
                  <article>
                    <div className="metric-header">
                      <span>Total courses</span>
                      <small>01</small>
                    </div>
                    <strong>{adminData.total_courses}</strong>
                    <p>Courses available on the learning platform.</p>
                  </article>

                  <article>
                    <div className="metric-header">
                      <span>Total students</span>
                      <small>02</small>
                    </div>
                    <strong>{adminData.total_students}</strong>
                    <p>Students currently registered with ViktoLearn.</p>
                  </article>

                  <article>
                    <div className="metric-header">
                      <span>Total enrollments</span>
                      <small>03</small>
                    </div>
                    <strong>{adminData.total_enrollments}</strong>
                    <p>Active course enrollment records.</p>
                  </article>

                  <article>
                    <div className="metric-header">
                      <span>Completed courses</span>
                      <small>04</small>
                    </div>
                    <strong>{adminData.completed_courses}</strong>
                    <p>Course completions recorded by the platform.</p>
                  </article>
                </div>

                <div className="admin-lower-grid">
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

                  <aside className="operations-card">
                    <div>
                      <span className="eyebrow">DELIVERY PLATFORM</span>
                      <h2>Operational stack</h2>
                    </div>

                    <div className="operations-list">
                      <div>
                        <span className="runtime-dot" />
                        <div>
                          <strong>GitOps delivery</strong>
                          <small>Argo CD · Helm</small>
                        </div>
                        <span>Managed</span>
                      </div>

                      <div>
                        <span className="runtime-dot" />
                        <div>
                          <strong>Observability</strong>
                          <small>Prometheus · Grafana · Loki</small>
                        </div>
                        <span>Enabled</span>
                      </div>

                      <div>
                        <span className="runtime-dot" />
                        <div>
                          <strong>Container security</strong>
                          <small>Trivy · non-root runtime</small>
                        </div>
                        <span>Hardened</span>
                      </div>

                      <div>
                        <span className="runtime-dot" />
                        <div>
                          <strong>Traffic management</strong>
                          <small>Envoy Gateway · Gateway API</small>
                        </div>
                        <span>Configured</span>
                      </div>
                    </div>
                  </aside>
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
            <div className="hero-badge">
              <span className="live-dot" />
              DEVOPS ENGINEERING PORTFOLIO
            </div>

            <h1>
              A learning platform
              <span> engineered to run.</span>
            </h1>

            <p className="hero-description">
              ViktoLearn is a full-stack application used to demonstrate an
              end-to-end DevOps platform: automated CI/CD, container security,
              Kubernetes, GitOps and production-style observability.
            </p>

            <div className="hero-actions">
              <a className="primary-button large" href="#platform">
                Explore the platform
                <span aria-hidden="true">→</span>
              </a>

              <a className="secondary-button large" href="#architecture">
                View architecture
              </a>
            </div>

            <div className="platform-health">
              <div>
                <span className="health-dot" />
                <span>Platform operational</span>
              </div>
              <span className="health-divider" />
              <span>GitOps managed</span>
              <span className="health-divider" />
              <span>Security scanned</span>
            </div>
          </div>

          <div className="hero-panel engineering-panel">
            <div className="panel-header">
              <div>
                <small>PLATFORM STATUS</small>
                <strong>ViktoLearn</strong>
              </div>

              <span className="status operational">
                <span className="status-dot" />
                Operational
              </span>
            </div>

            <div className="deployment-flow">
              <div className="flow-stage">
                <span className="flow-icon">01</span>
                <div>
                  <small>SOURCE</small>
                  <strong>GitHub</strong>
                </div>
                <span className="flow-state">✓</span>
              </div>

              <span className="flow-line" />

              <div className="flow-stage">
                <span className="flow-icon">02</span>
                <div>
                  <small>CI / SECURITY</small>
                  <strong>GitHub Actions</strong>
                </div>
                <span className="flow-state">✓</span>
              </div>

              <span className="flow-line" />

              <div className="flow-stage">
                <span className="flow-icon">03</span>
                <div>
                  <small>GITOPS</small>
                  <strong>Argo CD + Helm</strong>
                </div>
                <span className="flow-state">✓</span>
              </div>

              <span className="flow-line" />

              <div className="flow-stage">
                <span className="flow-icon">04</span>
                <div>
                  <small>RUNTIME</small>
                  <strong>Kubernetes</strong>
                </div>
                <span className="flow-state">✓</span>
              </div>
            </div>

            <div className="panel-runtime">
              <div>
                <span className="runtime-dot" />
                <span>Frontend</span>
                <strong>Running</strong>
              </div>
              <div>
                <span className="runtime-dot" />
                <span>API</span>
                <strong>Running</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="tech-strip" aria-label="Platform technologies">
          <span>Docker</span>
          <span>Kubernetes</span>
          <span>Helm</span>
          <span>Argo CD</span>
          <span>GitHub Actions</span>
          <span>Prometheus</span>
          <span>Grafana</span>
          <span>Loki</span>
          <span>Trivy</span>
          <span>Envoy Gateway</span>
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

        <section className="platform-section engineering-section" id="platform">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ENGINEERED END TO END</span>
              <h2>
                Platform engineering,
                <span> not just an application.</span>
              </h2>
            </div>

            <p>
              ViktoLearn demonstrates the complete delivery lifecycle of a
              containerized application, from source code and automated
              validation to GitOps deployment, observability and runtime
              security.
            </p>
          </div>

          <div className="engineering-grid">
            <article className="engineering-card">
              <div className="engineering-card-top">
                <span className="engineering-number">01</span>
                <span className="engineering-tag">AUTOMATED</span>
              </div>

              <h3>CI/CD</h3>
              <strong>GitHub Actions</strong>

              <p>
                Automated quality gates validate application code,
                containers and Kubernetes configuration before deployment.
              </p>

              <div className="pipeline-mini">
                <span>Test</span>
                <i>→</i>
                <span>Lint</span>
                <i>→</i>
                <span>Scan</span>
                <i>→</i>
                <span>Build</span>
                <i>→</i>
                <span>Push</span>
              </div>
            </article>

            <article className="engineering-card">
              <div className="engineering-card-top">
                <span className="engineering-number">02</span>
                <span className="engineering-tag">DECLARATIVE</span>
              </div>

              <h3>GitOps</h3>
              <strong>Argo CD + Helm</strong>

              <p>
                Immutable image tags are written back to Helm configuration
                and automatically synchronized into Kubernetes by Argo CD.
              </p>

              <div className="card-status-row">
                <span>
                  <i className="runtime-dot" />
                  Argo CD
                </span>
                <strong>Synced</strong>
              </div>
            </article>

            <article className="engineering-card">
              <div className="engineering-card-top">
                <span className="engineering-number">03</span>
                <span className="engineering-tag">OBSERVABLE</span>
              </div>

              <h3>Observability</h3>
              <strong>Prometheus · Grafana · Loki · Alloy</strong>

              <p>
                Application metrics, operational dashboards and centralized
                logs provide visibility into platform behavior.
              </p>

              <div className="observability-signals">
                <span>Metrics</span>
                <span>Dashboards</span>
                <span>Logs</span>
              </div>
            </article>

            <article className="engineering-card">
              <div className="engineering-card-top">
                <span className="engineering-number">04</span>
                <span className="engineering-tag">HARDENED</span>
              </div>

              <h3>Security</h3>
              <strong>Trivy · Hadolint · Kubernetes</strong>

              <p>
                Images are scanned in CI and workloads run with hardened
                container security contexts and non-root identities.
              </p>

              <div className="security-checks">
                <span>✓ Non-root</span>
                <span>✓ Read-only root filesystem</span>
                <span>✓ Image scanning</span>
              </div>
            </article>
          </div>
        </section>

        <section className="architecture-section" id="architecture">
          <div className="section-heading architecture-heading">
            <div>
              <span className="eyebrow">SYSTEM ARCHITECTURE</span>
              <h2>
                Designed as a
                <span> complete delivery platform.</span>
              </h2>
            </div>

            <p>
              Traffic enters through Envoy Gateway and is routed to the React
              frontend or FastAPI service. Application workloads run alongside
              PostgreSQL and Redis inside Kubernetes.
            </p>
          </div>

          <div className="architecture-board">
            <div className="architecture-top">
              <span className="architecture-label">INGRESS</span>
              <div className="architecture-node gateway-node">
                <small>GATEWAY API</small>
                <strong>Envoy Gateway</strong>
                <span>HTTP routing</span>
              </div>
            </div>

            <div className="architecture-flow-label">
              <span>/</span>
              <span>/api</span>
            </div>

            <div className="architecture-apps">
              <div className="architecture-node">
                <small>WEB</small>
                <strong>React</strong>
                <span>Frontend · :8080</span>
              </div>

              <div className="architecture-node api-node">
                <small>APPLICATION</small>
                <strong>FastAPI</strong>
                <span>REST API · :8000</span>
              </div>
            </div>

            <div className="architecture-api-flow">
              <span>APPLICATION DATA</span>
            </div>

            <div className="architecture-data">
              <div className="architecture-data-spacer" />

              <div className="architecture-data-services">
                <div className="architecture-node data-node">
                  <small>DATABASE</small>
                  <strong>PostgreSQL</strong>
                </div>

                <div className="architecture-node data-node">
                  <small>CACHE</small>
                  <strong>Redis</strong>
                </div>
              </div>
            </div>

            <div className="architecture-foundation">
              <span>Kubernetes</span>
              <span>Helm</span>
              <span>Argo CD</span>
              <span>Prometheus</span>
              <span>Grafana</span>
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
        <div className="footer-identity">
          <a className="brand" href="#">
            <span className="brand-mark">V</span>
            <span>
              ViktoLearn
              <small>DEVOPS ENGINEERING PORTFOLIO</small>
            </span>
          </a>

          <p>
            React · FastAPI · Docker · Kubernetes · GitOps · Observability
          </p>
        </div>

        <a
          className="footer-source"
          href="https://github.com/Viktoriia-DS/ViktoLearn-devops-platform"
          target="_blank"
          rel="noreferrer"
        >
          View source on GitHub →
        </a>
      </footer>
    </div>
  )
}

export default App
