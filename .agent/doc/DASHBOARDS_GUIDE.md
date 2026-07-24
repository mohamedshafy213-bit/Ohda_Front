# SIS Dashboards Guide

This guide provides a comprehensive overview of all dashboard pages within the SIS (Student Information System) project. It details the purpose, components, and data sources for each dashboard.

## 1. Admin Dashboards

### 1.1 Admin Dashboard

**Path:** `src/projects/sis/pages/dashboard/AdminDashboard.vue`
**Route:** `/dashboard`, `/admin-dashboard`
**Store:** `useAdminDashboardStore`

**Purpose:**
The primary operational dashboard for administrators, focusing on enrollment, GPA distribution, and demographics.

**Components:**

- **AdminKPI Cards:** Displays key performance indicators.
- **Enrollment Trend Chart:** Visualizes enrollment numbers over time.
- **GPA Distribution Chart:** Shows the distribution of student GPAs.
- **Demographics Charts:** Visualizes student demographics.
- **Level Performance Chart:** Analyzes performance across different academic levels.

### 1.2 SIS Admin Master Dashboard

**Path:** `src/projects/sis/pages/dashboard/SisAdminMasterDashboard.vue`
**Route:** `/sis/admin-master-dashboard`
**Store:** Local mock data (currently)

**Purpose:**
A high-level executive dashboard with a military/academic theme, providing a snapshot of the entire institution's status including attendance, discipline, and academic calendar.

**Components:**

- **Header:** Academic year and date display with refresh action.
- **KPI Cards:**
  - Students, Teachers, Employees, Courses counts.
  - Overall Attendance Rate.
- **Student Distribution (Bar Chart):** Breakdown by level (Preparatory, Intermediate, Final).
- **Attendance Overview (Doughnut Chart):** Present, Late, Absent stats with a date range filter.
- **GPA Distribution (Bar Chart):** Segmentation into Low, Medium, High.
- **Course Categories (Progress Bars):** Percentage breakdown of course types (e.g., Military Science, Fitness).
- **Lecture Schedule Table:** Today's lectures with time, course, instructor, and status.
- **Top Students List:** Ranking of top-performing students w/ GPA and Score.
- **Military Unit Distribution:** Visual breakdown of students across military units/battalions.
- **Discipline Overview:** Statistics on Violations, Rewards, and Suspensions.
- **Academic & Military Calendar:** Visual timeline of events (Exams, Field Training, Holidays).

### 1.3 Admin Landing Page

**Path:** `src/projects/sis/pages/dashboard/AdminLandingPage.vue`
**Route:** `/sis/admin-landing-page`

**Purpose:**
A landing page for school administrators to see immediate alerts, system status, and operational logs.

**Components:**

- **Welcome Hero:** Greetings with date and daily stats (Classes Today, Active Classrooms, Avg Attendance).
- **Needs Attention Widget:** List of pending actions (Leave Requests, Grade Approvals, Admission Apps).
- **System Status:** Server Uptime and Database Load indicators.
- **Quick Actions:** Shortcuts for common tasks (Add Student, Process Leave, Reports, Broadcast).
- **System Announcements:** Feed of operational logs (Library, Gate, Admissions).

### 1.4 Audit Dashboard

**Path:** `src/projects/sis/pages/dashboards/AuditDashboard.vue`
**Route:** `/sis/audit-dashboard`
**Store:** `useAuditDashboardStore`

**Purpose:**
Focuses on system security, integrity, and user activity monitoring.

**Components:**

- **Activity Heatmap:** Visual representation of system activity intensity.
- **Integrity Alerts:** List of system integrity warnings or alerts.
- **Audit Activity Chart:** Timeline of audit events.
- **User Activity Table:** Detailed log of user actions.

### 1.5 Institute Dashboard

**Path:** `src/projects/sis/pages/dashboards/InstituteDashboard.vue`
**Route:** `/sis/institute-dashboard`
**Store:** `useInstituteDashboardStore`

**Purpose:**
Provides insights into institutional health, focusing on attendance trends, incidents, and at-risk students.

**Components:**

- **Attendance Rate Widget:** Overall attendance metrics.
- **Incident Funnel Chart:** Visualization of incident stages/types.
- **At-Risk Students Table:** List of students identified as at-risk based on metrics.
- **Top Courses Chart:** Performance analysis of top courses.
- **Recent Incidents Timeline:** Chronological list of reported incidents.

---

## 2. Teacher Dashboards

### 2.1 Teacher Dashboard

**Path:** `src/projects/sis/pages/dashboard/TeacherDashboard.vue`
**Route:** `/sis/teacher-dashboard`

**Purpose:**
A comprehensive workspace for teachers to manage their classes, syllabus, attendance, and student performance.

**Components:**

- **Profile Widget:** Teacher details and quick stats (Classes, Students count).
- **Syllabus Status:** Doughnut chart showing completion progress.
- **Today's Class:** List of classes scheduled for the day.
- **Attendance Section:**
  - Weekly visualization.
  - Summary counts (Present, Absent, Late).
  - Doughnut chart breakdown.
- **Schedules:** Calendar view and upcoming events list.
- **Student Marks Table:** Detailed grades for students in specific subjects/classes.
- **Best Performers:** List of top students with visual progress bars.

### 2.2 Professor Landing Page

**Path:** `src/projects/sis/pages/dashboard/ProfessorLandingPage.vue`
**Route:** `/sis/professor-landing-page`
**Store:** `useCourseStore` (for schedule)

**Purpose:**
A streamlined landing page for professors, focusing on the day's schedule and active courses.

**Components:**

- **Welcome Hero:** Greetings and quick stats (Total Classes, Students, Hours).
- **Today's Schedule:** Timeline of lectures with status (Live, Upcoming, Completed) and actions (Start Class).
- **Quick Actions:** Shortcuts (Take Attendance, Gradebook, Email Class, Calendar).
- **Active Courses:** Grid of cards for currently active courses with student counts and management links.

---

## 3. Student Dashboards

### 3.1 Student Dashboard

**Path:** `src/projects/sis/pages/dashboard/StudentDashboard.vue`
**Route:** `/sis/student-dashboard`

**Purpose:**
The main hub for students to track their academic progress, attendance, schedules, and assignments.

**Components:**

- **Profile Widget:** Student details and academic status badge.
- **Today's Class:** List of daily classes.
- **Attendance Section:**
  - Summary metrics and weekly visualization.
  - Last 7 days status indicators.
- **Schedules & Exams:** Calendar and list of upcoming exams with countdowns.
- **Performance Chart:** Comparative line chart of Exam Scores vs. Attendance.
- **Home Works:** List of assignments with due dates and completion progress.
- **Class Faculties:** Contact cards for teachers (Email/Chat).
- **Leave Status:** History of leave requests and their statuses.
- **Exam Result:** Bar chart of recent exam performance.
- **Fees:** List of upcoming or due fees.
- **Notice Board:** School announcements.
- **Syllabus:** Subject-wise progress bars.
- **Todo List:** Personal task checklist.

### 3.2 Student Landing Page

**Path:** `src/projects/sis/pages/dashboard/StudentLandingPage.vue`
**Route:** `/sis/student-landing-page`
**Store:** `useCourseStore` (for schedule)

**Purpose:**
A simplified, welcoming entry point for students, highlighting the most immediate information.

**Components:**

- **Welcome Hero:** Greetings and personal stats (GPA, Attendance Rate, Credits).
- **Today's Schedule:** Timeline of daily classes with status indicators.
- **Quick Access:** Shortcuts to common sections (Courses, Grades, Punishments, Library).
- **Announcements:** Feed of important news and updates (Urgent tags supported).
