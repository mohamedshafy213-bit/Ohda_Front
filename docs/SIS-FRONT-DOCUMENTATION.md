# SIS-Front: Business & Workflow Documentation

**System Full Name:** Student Information System Frontend
**Arabic Name:** منظومة تطوير العملية التعليمية
**Version:** 0.0.0
**Last Updated:** March 2026
**Deployment Targets:** Web Browser, Progressive Web App (PWA), Electron Desktop
**Languages:** Arabic (RTL, default) and English (LTR)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Technical Foundation](#2-architecture--technical-foundation)
3. [User Roles & Access Control](#3-user-roles--access-control)
4. [Authentication & Security Workflow](#4-authentication--security-workflow)
5. [Module: Structure — Person & Organization Management](#5-module-structure--person--organization-management)
6. [Module: SIS — Core Academic Management](#6-module-sis--core-academic-management)
7. [Dashboards — Detailed Breakdown](#7-dashboards--detailed-breakdown)
8. [Module: HR Cycles — Human Resources](#8-module-hr-cycles--human-resources)
9. [Module: Security — Access Control Management](#9-module-security--access-control-management)
10. [Navigation & Layout](#10-navigation--layout)
11. [Data Entities & Relationships](#11-data-entities--relationships)
12. [Build, Environment & Deployment](#12-build-environment--deployment)

---

## 1. System Overview

### What is SIS-Front?

SIS-Front is the frontend of a comprehensive **Student Information System** designed for military and academic institutions. It serves as the primary interface for managing the complete academic lifecycle of students — from initial enrollment through graduation — while also supporting institutional operations including human resources, organizational structure, and access control.

The system handles the needs of multiple user types simultaneously:

- **Academic administrators** who configure courses, grade scales, and academic regulations
- **Instructors** who enter grades and track attendance
- **Students** who view their academic records, schedules, and submit leave requests
- **HR managers** who process leave and track absences and disciplinary actions
- **Auditors** who monitor data integrity and system activity
- **IT/Security administrators** who manage user access and permissions

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       SIS-Front (Vue 3)                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │   SIS    │  │Structure │  │ Security │  │ HR Cycles │  │
│  │ Module   │  │ Module   │  │ Module   │  │  Module   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       │              │              │               │        │
│       └──────────────┴──────────────┴───────────────┘        │
│                              │                               │
│                    ┌─────────┴──────────┐                   │
│                    │   Shared Services  │                   │
│                    │  • Pinia Stores    │                   │
│                    │  • Axios API Layer │                   │
│                    │  • i18n (AR/EN)    │                   │
│                    │  • Keycloak Auth   │                   │
│                    └─────────┬──────────┘                   │
└──────────────────────────────┼──────────────────────────────┘
                               │ HTTPS REST API
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
    ┌────┴────┐          ┌─────┴────┐          ┌─────┴────┐
    │ SIS API │          │ SEC API  │          │ HR API   │
    │:8152    │          │          │          │          │
    └─────────┘          └──────────┘          └──────────┘
                               │
                      ┌────────┴────────┐
                      │  Keycloak Auth  │
                      │  Server (OAuth2)│
                      └─────────────────┘
```

### Four Main Modules

| Module | Route Prefix | Purpose |
|--------|-------------|---------|
| **SIS** | `/sis` | Core academic management: courses, grades, schedules, dashboards |
| **Structure** | `/structure` | Person management (students, staff), organizational hierarchy, master data |
| **Security** | `/sec` | Authentication, user management, groups, page permissions |
| **HR Cycles** | `/hr-cycles` | Leave requests, absences, discipline, punishments |

---

## 2. Architecture & Technical Foundation

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Vue 3 (Composition API) | Reactive UI components |
| Build Tool | Vite 7.1.11 | Development server and production bundling |
| State Management | Pinia | Reactive data stores (one per feature) |
| Routing | Vue Router 4.6.3 | Client-side navigation with lazy-loaded routes |
| Styling | Tailwind CSS v4 + PrimeVue (unstyled) | Utility-first CSS with accessible component base |
| HTTP Client | Axios 1.12.2 | REST API communication with interceptors |
| Authentication | Keycloak (OAuth2/OIDC) | Token-based auth with automatic refresh |
| Forms | VeeValidate 4.15.1 + Yup | Form validation with schema-based rules |
| Internationalization | vue-i18n 11.1.11 | Arabic/English locale switching with RTL |
| Charts | Chart.js 4.5.1 + Vue ChartJS | Dashboard data visualizations |
| Desktop | Electron 38.4.0 | Native desktop app wrapper |

### Project Structure

```
src/
├── main.js                    # App bootstrap: Vue, Pinia, Router, i18n, PrimeVue
├── App.vue                    # Root: router-view + toast notifications
├── router/
│   └── index.js               # Master router importing all module routes
├── stores/
│   ├── baseStore.js           # Global state: user info, page tree, nav menu, permissions
│   └── toastStore.js          # Toast notification state
├── utilities/
│   ├── apiClient.js           # Axios instance + Keycloak token management
│   ├── fetchApi.js            # apiGet/apiPost/apiPut/apiDelete/apiPatch wrappers
│   ├── validations.js         # VeeValidate + Yup rules
│   └── functions.js           # Date, locale, and general helper functions
├── layouts/
│   ├── mainLayoutWithSidebar.vue  # Authenticated app shell (sidebar + topbar + content)
│   └── loginLayout.vue            # Unauthenticated login shell
├── components/                # Shared UI: ConfirmDialog, DeleteDialog, Breadcrumb, etc.
├── volt/                      # Tailwind-styled PrimeVue component wrappers (Button, DataTable, etc.)
├── i18n/                      # Translation files and locale configuration
└── projects/
    ├── sis/                   # Student Information System module
    │   ├── router.js          # 45+ SIS routes
    │   ├── stores/            # 30+ Pinia stores
    │   └── pages/             # Vue page components
    ├── security/              # Authentication and access control
    ├── structure/             # Person and organization management
    └── hr_cycles/             # HR, leave, and discipline management
```

### State Management Pattern

Each significant feature has its own Pinia store following this structure:

```
Feature Store (e.g., courseStore.js)
├── State: list of records, loading flags, selected item, filter params
├── Actions:
│   ├── fetchAll()       → GET /sis_api/Course
│   ├── fetchById()      → GET /sis_api/Course/{id}
│   ├── create()         → POST /sis_api/Course
│   ├── update()         → PUT /sis_api/Course/{id}
│   └── delete()         → DELETE /sis_api/Course/{id}
└── Getters: derived lists, computed totals
```

### Internationalization (Arabic/English)

- Default locale: Arabic (ar)
- Supported: Arabic (`ar`, RTL) and English (`en`, LTR)
- Language stored in `localStorage` as `selectedLocale`
- Switching language: updates i18n locale + flips `document.dir` (rtl ↔ ltr)
- All API requests include `Accept-Language: {locale}` header so responses arrive in the selected language
- Every UI label, button, and message has both an Arabic and English translation

---

## 3. User Roles & Access Control

### Role Overview

| Role | Primary Dashboard | Key Capabilities |
|------|-----------------|-----------------|
| **Admin** | Admin Dashboard | System-wide KPIs, full access to all modules |
| **Institute Manager** | Institute Dashboard | Day-to-day ops, incidents, at-risk student monitoring |
| **Auditor** | Audit Dashboard | Compliance monitoring, data integrity, audit trails |
| **Operations Manager** | Operational Dashboard | Assessment, attendance, discipline, leave, personnel, schedule |
| **Teacher / Professor** | Teacher Dashboard | Grade entry, course attendance, class schedule |
| **Student** | Student Portal | View own grades, schedule, active polls, submit leave requests |
| **HR Manager** | HR Cycles | Leave request approvals, absence tracking, discipline records |
| **Security Admin** | Security Module | User accounts, security groups, page permission matrix |

### How Permissions Work

1. **Keycloak Roles** — each user account is assigned one or more roles in Keycloak
2. **Page Tree** — after login, the backend returns a page tree (`PAGES_TREE`) listing which pages/routes the user can access
3. **`baseStore.checkPageExists()`** — every protected route calls this before rendering
4. **Navigation Menu** — the sidebar is built dynamically from the page tree; users only see links they have access to
5. **Multi-Role Support** — users with multiple roles see a role selection screen after login and can switch roles during a session

### Role Selection Flow

```
Login Complete
     │
     ▼
Does user have multiple roles?
     │
  Yes │                  │ No
     ▼                   ▼
Role Selection     Redirect to default
    Page           page: /sis/lecture-schedule
     │
     ▼
User selects role
     │
     ▼
Role stored in session
     │
     ▼
Redirect to default page
```

---

## 4. Authentication & Security Workflow

### Login Flow (Step by Step)

```
1. User opens app
        │
        ▼
2. App checks localStorage for valid JWT token
        │
   Token valid? ──Yes──► Navigate to last page / default page
        │
       No
        │
        ▼
3. Redirect to /sec/login (Login Page)
        │
        ▼
4. User clicks "Login" button
        │
        ▼
5. App redirects to Keycloak OAuth2 authorization URL
   (VITE_KEYCLOAK_URL/realms/VITE_KEYCLOAK_REALM/protocol/openid-connect/auth)
        │
        ▼
6. User enters credentials in Keycloak login page
        │
        ▼
7. Keycloak validates credentials
        │
   TOTP 2FA enabled? ──Yes──► /sec/totp-page (enter authenticator code)
        │                                │
       No                                ▼
        │                    Keycloak validates TOTP
        │                                │
        └────────────────────────────────┘
        │
        ▼
8. Keycloak redirects back with authorization code
        │
        ▼
9. App exchanges code for:
   • accessToken  (JWT, short-lived: ~5 minutes)
   • refreshToken (longer-lived: hours/days)
   • userInfo     (name, email, roles)
        │
        ▼
10. Tokens stored in localStorage
        │
        ▼
11. App fetches user's page tree (PAGES_TREE) from backend
        │
        ▼
12. Navigate to role selection (if multi-role) or default page
```

### Token Lifecycle (Automatic Refresh)

The API client (`src/utilities/apiClient.js`) proactively manages token expiry:

- Before every API request, the token expiry time is checked
- If the token expires within **45 seconds**, a silent refresh is triggered
- The refresh uses the `refreshToken` to obtain a new `accessToken` without user interaction
- If the refresh fails (expired refresh token), all tokens are cleared and the user is redirected to login

### Error Handling

| HTTP Status | Meaning | System Response |
|-------------|---------|----------------|
| 300 | Validation error from server | Show validation message in toast |
| 401 | Unauthorized | Retry once with refreshed token; redirect to login if retry fails |
| 403 | Forbidden | Redirect to no-access page |
| 404 | Resource not found | Show not-found toast notification |
| 5xx | Server error | Show generic error toast notification |

---

## 5. Module: Structure — Person & Organization Management

### Purpose

The Structure module is the **master data foundation** of the entire system. It manages all people (students, staff, instructors, managers) and the organizational hierarchy. Data entered here is referenced throughout SIS, HR, and other modules.

### 5.1 Student Management

#### Adding a New Student

Students are added through a multi-tab form covering all required data segments:

```
Step 1: Personal Data
├── Full name (Arabic and English)
├── National ID number
├── Date of birth
└── Gender

Step 2: Military Details
├── Military rank
├── Military weapon/branch
├── Batch (intake year/group)
└── Enrollment type

Step 3: Contact Information
├── Phone numbers
├── Address
├── Governate / District
└── Emergency contact

Step 4: Qualifications
├── Educational background
└── Certificates and degrees

Step 5: Enrollment
└── Assign to academic level and section
```

#### Student Bulk Upload

For importing many students at once:

1. Download the Excel template from the Bulk Upload page
2. Fill in student data according to the template columns
3. Upload the completed file
4. System validates each row; errors are reported per row
5. Confirm valid records to create all student accounts simultaneously

#### Editing and Viewing Students

- **Edit Mode**: All data tabs are editable; changes saved per tab
- **View Mode**: Read-only display of all student information
- **Delete**: Soft delete with confirmation dialog (student records are preserved for audit purposes)

### 5.2 Teaching Staff Management

Teaching staff follow a similar profile structure:

1. Add personal + contact data
2. Add qualifications
3. Instructors are linked to courses from within the SIS module (not here)

### 5.3 Organization Hierarchy

The organization hierarchy defines the institutional structure:

```
University / Institution
    └── College / Faculty
            └── Department
                    └── Unit / Section
```

This hierarchy is visualized as:
- An interactive **tree view** for navigation
- An **organizational chart** (org chart widget) for visual presentation

The hierarchy drives dropdown options across the system. When creating sections, assigning students, or filtering dashboards, the options available depend on the organizational structure defined here.

### 5.4 Master Data (Lookup Tables)

The following reference data tables are managed in the Structure module. They populate dropdown menus throughout the system:

| Category | Items |
|----------|-------|
| Personal | Blood Types, Religions, Nationalities |
| Geographic | Governates, Districts |
| Military | Military Ranks, Military Weapons/Branches, Batches (intake cohorts) |
| Academic | Qualifications, Colleges |
| Employment | Jobs, Job Levels |
| Housing | Regular Housing Types, Military Housing Types |

---

## 6. Module: SIS — Core Academic Management

### Purpose

The SIS module is the heart of the system, covering the complete academic lifecycle: configuration, scheduling, instruction, grading, and results reporting.

### 6.1 Academic Year Setup

Before each academic year, administrators configure the structure that governs the entire year:

```
Academic Year Setup Workflow
════════════════════════════

1. Create Academic Year
   └── Name (e.g., "2025-2026"), start date, end date

2. Define Semesters
   └── First Semester, Second Semester (with start/end dates)

3. Configure Academic Levels
   └── 1st Year, 2nd Year, 3rd Year, 4th Year
   └── Each level linked to the academic year

4. Set Academic Regulations
   └── Rules governing pass/fail criteria for each level
   └── Minimum GPA requirements
   └── Maximum allowed course failures

5. Define Enrollment Types
   └── Regular (standard enrollment)
   └── Transfer (from another institution)
   └── Repeat (repeating a failed year)
```

### 6.2 Course Management

#### Full Course Setup Workflow

```
1. Create Course
   ├── Course name (AR + EN)
   ├── Course code
   ├── Credit hours
   ├── Category (e.g., Core, Elective)
   └── Type (e.g., Theoretical, Practical)

2. Assign to Academic Level(s)
   ├── Link to one or more academic levels
   └── Mark as Required or Optional per level

3. Configure Degree Divisions (Grade Components)
   ├── Define grade breakdown (e.g., Midterm, Final, Practical)
   ├── Set weight/percentage for each component
   └── Set maximum score for each component
   Example:
     • Midterm Exam:  30 points
     • Final Exam:    50 points
     • Practical:     20 points
     • Total:        100 points

4. Assign Instructors
   └── Link one or more teaching staff members to the course

5. Schedule Lectures (Lecture Schedule)
   ├── Select period (time slot)
   ├── Select room / classroom
   ├── Select section (student group)
   └── Set recurrence

6. Assign Student Groups (Group Schedule)
   └── Link specific student groups to scheduled lecture slots

7. Track Attendance
   └── Per lecture session, mark each student:
       Present / Absent / Excused
```

**Course Status States:**

| Status | Meaning |
|--------|---------|
| `Active` | Currently being taught this semester |
| `NotActive` | Not offered this semester |
| `InProgress` | Setup started but not yet active |

### 6.3 Grade Entry & Calculation

#### Grade Entry Workflow

```
Instructor opens Course Grade Entry page
        │
        ▼
Select Academic Year + Level + Division (grade component)
        │
        ▼
Student list loads with empty grade fields
        │
        ▼
Instructor enters each student's score for this component
(System validates: score must be ≤ max grade for this division)
        │
        ▼
Grades are saved per student per division
        │
        ▼
System auto-calculates Final Grade:
  Final Grade = Σ (Division Score × Division Weight)
        │
        ▼
GPA Points computed from Final Grade using Grade Scale:
  e.g., 90-100 → A+ → 4.0 GPA points
       80-89  → A  → 3.7 GPA points
       etc.
```

#### Grade Scale Configuration

Administrators configure the grade scale (grading boundaries and GPA equivalents). The grade scale defines:

- Letter grade ranges (e.g., A+, A, B+, B, C+, C, D, F)
- Corresponding GPA points (e.g., A+ = 4.0)
- Minimum passing score

This scale is applied system-wide when calculating final GPAs.

### 6.4 Pass/Fail Determination

#### The 5 Pass/Fail Outcome States

At the end of each semester, the system evaluates every student against the configured regulations and assigns one of five outcomes:

| Outcome | Arabic | Meaning |
|---------|--------|---------|
| **Pass** | ناجح | Student meets all requirements; advances to next level |
| **PassWithWarning** | ناجح مع إنذار | Passes but GPA is below the warning threshold; academic warning issued |
| **Conditional** | مشروط | Conditionally passes pending completion of additional requirements |
| **FailCourse** | راسب في مادة | Fails one or more specific courses but still advances to the next level |
| **FailYear** | راسب في السنة | Fails the entire academic year; must repeat the year |

#### Pass/Fail Workflow

```
1. Admin configures Pass/Fail Regulations
   ├── Minimum grade to pass each course
   ├── Maximum number of course failures allowed
   ├── GPA threshold for PassWithWarning
   └── Conditions for Conditional pass

2. End of Semester
   └── All grades must be entered and finalized

3. Run Pass/Fail Calculation
   └── System evaluates each student against regulations
       For each student:
         ├── Check each course: pass or fail?
         ├── Count total failed courses
         ├── Calculate cumulative GPA
         └── Apply regulations → assign outcome

4. Review Results (Pass/Fail Results page)
   ├── Filter by Academic Level and Section
   ├── See outcome for every student
   └── CoursesTab: view grade breakdown per course per student

5. Corrections (if needed)
   ├── Inline grade editing available in CoursesTab
   └── Changes are logged in Grade Change Log

6. Publish/Finalize Results
   └── Results are made visible to students
```

### 6.5 Grade Change Log (Audit Trail)

Any modification to a grade after initial entry is automatically captured in the Grade Change Log. This provides a complete audit trail for regulatory compliance.

**What is recorded for each change:**
- Student name and ID
- Course name and code
- Grade division (component) that was changed
- Previous grade value (before)
- New grade value (after)
- Who made the change (user account)
- When the change was made (timestamp)

**Accessing the Grade Change Log:**

```
Navigate to: /sis/grade-change-log
        │
        ▼
Apply filters:
├── Academic Year
├── Academic Level
├── Student (optional)
├── Course (optional)
└── Grade Division (optional)
        │
        ▼
View results in two formats:

Timeline View                    Table View
──────────────                   ──────────
Visual chronological             Sortable, paginated
  history per student             data grid
Shows before/after               Column filters
  values graphically             Export capable
Color-coded:
  ▲ Green = grade increased
  ▼ Red = grade decreased
```

### 6.6 Academic Results & Analysis

Several reporting pages provide insight into academic performance:

| Page | Purpose |
|------|---------|
| **Course Grade Analysis** | Distribution of grades across all students in a course; shows grade histogram |
| **Exam Results Analysis** | Pass/fail statistics by division and academic level |
| **Student Grades by Division** | Per-student breakdown of each grade component across all courses |
| **Academic Level Results** | Overall semester results for an entire cohort of students |
| **Student Distribution** | How students are distributed across sections and academic levels |

### 6.7 Fitness Evaluations

Students in military institutions must pass physical fitness assessments. The Fitness module:

- Defines fitness exercise types (e.g., push-ups, 3km run, swimming)
- Records scores per student per exercise
- Calculates fitness pass/fail separately from academic GPA
- Scores are part of the student's overall profile

### 6.8 Student Warnings

The Warnings system proactively identifies at-risk students:

1. Administrators configure warning rules:
   - GPA below threshold (e.g., GPA < 2.5)
   - Absence rate above threshold (e.g., > 25% absences)
2. The system evaluates students against these rules
3. Flagged students appear on the Institute Dashboard's "At-Risk Students" widget
4. Warning records can be reviewed and actioned

### 6.9 Attendance & Discipline Grades

Beyond academic grades, students receive an **Attendance Discipline Grade** — a conduct/attendance score that may factor into the Pass/Fail calculation:

- Recorded separately per student per semester
- Managed by administrative staff
- Integrated with the Pass/Fail engine via regulation rules

### 6.10 Calendar

The Academic Calendar provides:

- Visual monthly/weekly calendar view
- Academic events, exam dates, holidays
- Lecture schedule overlay

### 6.11 Voting & Polls Module

The Voting module enables institutions to conduct formal polls and elections:

```
Poll Lifecycle
══════════════

1. Create Poll (Admin)
   ├── Poll title and description
   ├── Options/candidates
   ├── Start and end date/time
   └── Voting type (single choice / multiple choice)

2. Configure Voting Groups
   ├── Define which students/staff can vote
   ├── Assign by academic level, section, or custom group
   └── Link group to the poll

3. Voting Period Opens
   └── Students see active polls in their Student Portal

4. Student Votes
   ├── Student selects their choice
   ├── Confirmation dialog before final submission
   └── Vote recorded (anonymous or attributed per configuration)

5. Poll Closes
   └── No more votes accepted

6. View Analytics
   ├── Real-time results during voting period
   ├── Final results and charts after closing
   ├── Participation rates per group
   └── Breakdown by option/candidate

7. Clone Poll (Optional)
   └── Re-use an existing poll's structure for a new election cycle
```

---

## 7. Dashboards — Detailed Breakdown

Each dashboard is tailored to a specific role and presents a curated set of metrics and widgets relevant to that role's responsibilities.

### 7.1 Admin Dashboard

**Audience:** System administrators, academic directors, institutional leadership
**Route:** `/sis/admin-dashboard`

#### KPI Cards (Top Row)

| KPI | Description |
|-----|-------------|
| Total Active Students | Count of enrolled students with period-over-period % change |
| Total Staff | All non-instructor staff count |
| Total Instructors | Teaching staff count |
| Average GPA | System-wide GPA average across all active students |
| Current Enrollments | Number of active enrollments this semester |
| Active Discipline Incidents | Open disciplinary cases count |

#### Dashboard Widgets

| Widget | Type | Description |
|--------|------|-------------|
| Enrollment Trends | Line/Bar chart | Monthly enrollment counts over the past 12 months |
| GPA Distribution | Histogram | Number of students in each GPA band (0-1, 1-2, 2-3, 3-4) |
| Gender Breakdown | Pie/Donut chart | Male vs. female student distribution |
| Military Demographics | Bar chart | Student breakdown by military rank and weapon/branch |
| Performance by Academic Level | Table | Average GPA per year level with trend indicators |

### 7.2 Institute Dashboard

**Audience:** Institute managers, operations directors
**Route:** `/sis/institute-dashboard`

#### Widgets

| Widget | Description |
|--------|-------------|
| **Attendance Rate** | Overall attendance percentage with breakdown: Present / Absent / Excused |
| **Incident Funnel** | Pipeline of discipline incidents by status: Open → InProgress → Resolved → Closed |
| **At-Risk Students** | Paginated table of students with GPA < 2.5 or high absence rates. Fields: name, GPA, absence count, risk level (Critical / Warning / Monitor) |
| **Top Courses by Enrollment** | Top 10 most-enrolled courses this semester |
| **Recent Incidents** | Paginated list of disciplinary incidents from the last 30 days |

### 7.3 Audit Dashboard

**Audience:** Compliance officers, data integrity auditors
**Route:** `/sis/audit-dashboard`

#### Widgets

| Widget | Description |
|--------|-------------|
| **Activity Heatmap** | GitHub-style 90-day activity heatmap. Color intensity represents volume of changes made on each day. Helps identify unusual activity spikes |
| **Integrity Alerts** | Automated checks for data problems: students without a GPA recorded, suspected duplicate IDs, records with missing required data |
| **Audit Activity** | Breakdown of system activity by week, by data table, and by action type (Create / Update / Delete) |
| **User Activity Leaderboard** | Ranked list of users by number of creates, updates, and deletes — useful for identifying data entry patterns or anomalies |
| **Compliance Report** | Data completeness percentages, SLA adherence rates, and audit trail coverage |

### 7.4 Operational Dashboard

**Audience:** Operations managers, coordinators
**Route:** `/sis/operational-dashboard`

The Operational Dashboard uses a **7-tab interface** with global filters applied across all tabs:

**Global Filters:**
- University / Institution
- Semester
- Academic Level
- Iteration (academic cycle)
- Date Range

#### Tab Descriptions

| Tab | Content |
|-----|---------|
| **Assessment** | Grade statistics: average scores, exam performance KPIs, failing rate per course |
| **Attendance** | Course attendance rates by class and level, absence trend charts, most-absent students |
| **Discipline** | Discipline incident counts, warning distribution, severity breakdown |
| **Leave** | Leave request pipeline: pending / approved / rejected counts, leave type distribution |
| **Personnel** | Staff headcounts, instructor teaching loads, staff-to-student ratios |
| **Schedule** | Lecture schedule utilization, room occupancy rates, unscheduled periods |
| **Structure** | Organizational breakdown: students per level, students per unit/section |

---

## 8. Module: HR Cycles — Human Resources

### Purpose

The HR Cycles module manages the human resources operations of the institution, including leave management for employees and absence/discipline management for students.

### 8.1 Leave Request Workflow (Employees)

```
Employee Leave Request Process
══════════════════════════════

1. Employee Submits Request
   ├── Leave type: Annual / Sick / Mission / Clinic / Other
   ├── Start date and end date
   ├── Reason (if required)
   └── Supporting documents (if required)

2. Manager Reviews
   ├── Manager sees pending requests for their team
   ├── Reviews leave balance and request reason
   └── Approves or Rejects with comment

3. HR Processing
   ├── HR records the approved leave
   └── Updates leave balance

4. Leave Balance Update
   └── Employee's remaining leave days auto-decremented

5. Employee Views History
   └── Employee can view their:
       ├── Remaining leave balance by type
       └── Full history of past requests and outcomes
```

**Leave Types:**

| Type | Description |
|------|-------------|
| Annual | Standard paid annual leave allowance |
| Sick | Medical leave (may require doctor's note) |
| Mission | Official duty travel / assignment |
| Clinic | Medical appointment leave |

### 8.2 Leave Request Groups

Groups allow batch processing of leave requests for shared activities:

- Create a group for a specific event (e.g., field training)
- Add multiple employees or students to the group
- Submit as one batch approval request
- Useful for organized trips, training exercises, and shared official duties

### 8.3 Student Absence Tracking

```
Student Absence Tracking Flow
══════════════════════════════

1. Absence Recorded
   └── Instructor marks student absent during Course Attendance
       (in SIS module → Course Attendance page)

2. HR Aggregation
   └── HR module aggregates all absences per student

3. Threshold Check
   └── When absence count exceeds configured threshold:
       ├── Absence rate calculated (e.g., > 25% of total sessions)
       └── Threshold breach flag triggered

4. Office Summons
   ├── System generates a formal office summons record
   ├── Summons assigned to responsible officer
   └── Student notified (if notification configured)

5. Summons Resolution
   ├── Officer investigates and records outcome
   ├── Student explanation recorded
   └── Summons marked as Resolved or escalated
```

### 8.4 Discipline & Punishment Management

```
Discipline Process
══════════════════

1. Incident Created
   ├── Created against a student or employee
   ├── Incident type assigned (from master data lookup)
   ├── Description and evidence recorded
   └── Severity level assigned

2. Punishment Assignment
   ├── Punishment type selected from lookup table
   ├── Duration / severity of punishment specified
   └── Job punishment authority validation:
       └── System checks if the assigning officer has
           authority to issue this type of punishment

3. Record Kept
   └── Full discipline record stored permanently:
       ├── Used in audit reports
       ├── May affect GPA / Pass/Fail (if regulations reference it)
       └── Available for academic level performance review

4. Resolution / Appeal
   └── Status tracked: Open → InProgress → Resolved → Closed
```

---

## 9. Module: Security — Access Control Management

### Purpose

The Security module manages who can access the system, what they can see, and what actions they can perform. It is the administrative backend for Keycloak-based access control.

### 9.1 User Management

- Create and edit user accounts
- Link to Keycloak identities (single sign-on)
- Assign users to one or more security groups
- Assign service-level access
- Deactivate accounts without deleting history

### 9.2 Groups & Permissions

The permission system works through a group-based model:

```
User ──belongs to──► Security Group ──has access to──► Pages/Routes

Example:
  "Grade Entry Staff" group
    ├── Can access: /sis/student-grades
    ├── Can access: /sis/courses
    ├── Cannot access: /sis/admin-dashboard
    └── Cannot access: /structure/*
```

**Permission levels per page:**
- **Read** — can view the page and its data
- **Write** — can create and edit records
- **Delete** — can delete records

### 9.3 Module Management

Administrators can enable or disable entire modules per deployment:

- In some installations, only specific modules are licensed or needed
- Disabling a module hides it from all users' navigation
- Modules: SIS, Structure, HR Cycles (Security itself cannot be disabled)

### 9.4 Page Permissions Matrix

A full matrix view is available showing:
- Rows: all pages/routes in the system
- Columns: all security groups
- Cells: permission level (None / Read / Write / Delete)

This allows bulk permission editing and auditing of who can access what.

---

## 10. Navigation & Layout

### Application Shell

The authenticated application uses a consistent layout:

```
┌─────────────────────────────────────────────────────────┐
│  TOP BAR                                                │
│  [Logo] [Breadcrumb Trail]    [Lang AR/EN] [User Menu] │
├───────────────────┬─────────────────────────────────────┤
│                   │                                     │
│   SIDEBAR         │   MAIN CONTENT AREA                 │
│                   │                                     │
│  ▶ SIS            │   Current page renders here         │
│    ▶ Dashboards   │                                     │
│    ▶ Courses      │                                     │
│    ▶ Grades       │                                     │
│    ▶ Schedule     │                                     │
│  ▶ Structure      │                                     │
│  ▶ HR Cycles      │                                     │
│  ▶ Security       │                                     │
│                   │                                     │
└───────────────────┴─────────────────────────────────────┘
```

### Sidebar Navigation

- **Collapsible**: Can be collapsed to icon-only mode for more screen space
- **Hierarchical**: Main sections expand to show sub-pages
- **Permission-filtered**: Users only see sections and pages they have access to
- **Active state**: Current page highlighted in the sidebar
- **Icons**: Lucide Vue icon library for all navigation icons

### Top Bar

| Element | Function |
|---------|---------|
| Logo / Institution name | Home link |
| Breadcrumb | Shows current location (e.g., SIS > Grades > Grade Change Log) |
| Language Toggle | Switches between Arabic (RTL) and English (LTR) |
| User Avatar + Name | Opens user menu: profile settings, role switch, logout |

### Breadcrumb Navigation

Breadcrumbs are generated dynamically by `baseStore` based on the current route. Example:

```
SIS > Academic Management > Pass/Fail Results
```

Each breadcrumb segment is clickable and navigates to the corresponding page.

---

## 11. Data Entities & Relationships

### Core Entity Map

```
AcademicYear
    │
    ├──► Semester (1-2 per year)
    │
    └──► AcademicLevel (1st, 2nd, 3rd, 4th year)
              │
              ├──► AcademicRegulation (pass/fail rules)
              │
              ├──► Student (enrolled at this level)
              │         │
              │         ├──► Grade (per course per division)
              │         │         │
              │         │         └──► GradeChangeLog (audit trail)
              │         │
              │         ├──► PassFailResult (semester outcome)
              │         │
              │         ├──► Absence (per course session)
              │         │
              │         └──► FitnessScore (per exercise)
              │
              └──► Course (taught at this level)
                        │
                        ├──► DegreeDivision (grade components)
                        ├──► Instructor (teaching staff link)
                        ├──► LectureSchedule (time/room slots)
                        └──► CourseAttendance (session records)
```

### Entity Reference Table

| Entity | Key Fields | Linked To |
|--------|-----------|-----------|
| **Student** | personId, name, nationalId, cumulativeGpa, riskLevel | AcademicLevel, Section, Grade, Absence |
| **Course** | id, code, name, creditHours, status | AcademicLevel, DegreeDivision, Instructor |
| **AcademicYear** | id, name, startDate, endDate | Semester, AcademicLevel |
| **AcademicLevel** | id, name, levelNumber | AcademicYear, Student, Course, Regulation |
| **Instructor** | personId, name | Course |
| **DegreeDivision** | id, name, weight, maxGrade | Course |
| **Grade** | studentId, courseId, divisionId, earnedGrade, maxGrade | PassFail calculation, GradeChangeLog |
| **GradeChangeLog** | id, beforeValue, afterValue, changedBy, changedAt | Grade |
| **PassFailResult** | studentId, levelId, semesterId, status (1-5) | AcademicRegulation |
| **AcademicRegulation** | id, minPassGrade, maxFailures, warnThreshold | AcademicLevel |
| **Incident** | id, studentId, type, status | Punishment, Office Summons |
| **LeaveRequest** | id, employeeId, type, startDate, endDate, status | LeaveBalance |
| **LectureSchedule** | id, courseId, periodId, roomId, sectionId | Course, Period, Room |
| **VotingPoll** | id, title, options, startDate, endDate | VotingGroup, Vote |

### Pass/Fail Status Values

| Value | Status Name | Description |
|-------|------------|-------------|
| 1 | Pass | Student passes all requirements |
| 2 | PassWithWarning | Passes but GPA triggers academic warning |
| 3 | Conditional | Conditionally passes; must meet additional requirements |
| 4 | FailCourse | Fails one or more courses; may still advance |
| 5 | FailYear | Fails the academic year; must repeat |

---

## 12. Build, Environment & Deployment

### Environment Configuration

The system uses three environment files for different deployment contexts:

| File | Context | Key Settings |
|------|---------|-------------|
| `.env` | Development | `VITE_ROOT_URL=https://localhost:8152/`, Keycloak dev realm |
| `.env.production` | Production web | Production API URL, production Keycloak |
| `.env.electron` | Electron desktop | Electron-specific path and API configuration |

#### Key Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_ROOT_URL` | Backend API base URL | `https://localhost:8152/` |
| `VITE_KEYCLOAK_URL` | Keycloak server URL | `https://www.isd-sis.mil/authentication` |
| `VITE_KEYCLOAK_REALM` | Keycloak realm name | `master` |
| `VITE_KEYCLOAK_CLIENT_ID` | OAuth2 client ID | `sis` |
| `VITE_BASE_PATH` | App base URL path | `./` |

### Build Commands

| Command | Output | Use Case |
|---------|--------|---------|
| `npm run dev` | Dev server on port 5173 | Local development |
| `npm run build` | `dist/` folder | Production web deployment |
| `npm run preview` | Static preview server | Test production build locally |
| `npm run electron` | Electron + dev server | Desktop app development |
| `npm run electron-build` | Platform installer (.exe) | Desktop app distribution |

### Node.js Requirement

Node.js version `^20.19.0` or `>=22.12.0` is required.

### Deployment Targets

| Target | Method | Notes |
|--------|--------|-------|
| **Web Server** | Copy `dist/` to web server | Standard nginx/Apache hosting |
| **PWA** | Included in web build | Installable from browser; works offline |
| **Windows Desktop** | Run `npm run electron-build` | Produces `.exe` installer |
| **Keycloak** | External service (not bundled) | Must be deployed and configured separately |
| **Backend API** | External service (not bundled) | Microservices on port 8152 (default) |

---

## Appendix: Key File Reference

| File | Path | Purpose |
|------|------|---------|
| App Entry | `src/main.js` | Bootstrap: plugins, stores, router |
| Root Component | `src/App.vue` | Router view + toast container |
| Master Router | `src/router/index.js` | All module routes combined |
| SIS Routes | `src/projects/sis/router.js` | 45+ SIS feature routes |
| Global State | `src/stores/baseStore.js` | User, permissions, nav menu |
| API Client | `src/utilities/apiClient.js` | Axios + Keycloak token management |
| API Wrappers | `src/utilities/fetchApi.js` | get/post/put/delete/patch helpers |
| Auth Store | `src/projects/security/stores/authStore.js` | Keycloak login/logout/refresh |
| Grade Change Log Store | `src/projects/sis/stores/gradeChangeLogStore.js` | Grade audit trail |
| Pass/Fail Store | `src/projects/sis/stores/passFailResultsStore.js` | Pass/fail engine |
| Admin Dashboard Store | `src/projects/sis/stores/useAdminDashboardStore.js` | Admin KPIs and charts |
| Operational Dashboard Store | `src/projects/sis/stores/useOperationalDashboardStore.js` | 7-tab operational data |
| Main Layout | `src/layouts/mainLayoutWithSidebar.vue` | Authenticated app shell |

---

*For API endpoint details, request/response formats, and error handling reference, see [API-REFERENCE.md](./API-REFERENCE.md).*
