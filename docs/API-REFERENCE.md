# SIS-Front: API Reference

**Last Updated:** March 2026
**Backend Base URL:** Configured via `VITE_ROOT_URL` environment variable (default: `https://localhost:8152/`)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [API Namespaces](#2-api-namespaces)
3. [Using the API Wrappers](#3-using-the-api-wrappers)
4. [Common Endpoint Patterns](#4-common-endpoint-patterns)
5. [Request Headers](#5-request-headers)
6. [Response & Error Handling](#6-response--error-handling)
7. [Endpoint Reference by Module](#7-endpoint-reference-by-module)

---

## 1. Authentication

All API requests require a valid Keycloak JWT access token.

### Token Flow

```
Keycloak OAuth2/OIDC
        │
        ▼
POST {VITE_KEYCLOAK_URL}/realms/{realm}/protocol/openid-connect/token
        │
        ▼
Returns: { access_token, refresh_token, expires_in, ... }
        │
        ▼
Stored in localStorage:
  • accessToken
  • refreshToken
  • userInfo (decoded JWT payload)
```

### Keycloak Configuration

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_KEYCLOAK_URL` | Keycloak server URL | `https://www.isd-sis.mil/authentication` |
| `VITE_KEYCLOAK_REALM` | Realm name | `master` |
| `VITE_KEYCLOAK_CLIENT_ID` | OAuth2 client identifier | `sis` |

### Token Refresh

The API client (`src/utilities/apiClient.js`) automatically manages token refresh:

- Checks token expiry before every request
- Refreshes 45 seconds before expiry (proactive refresh)
- On 401 response: retries the request once with a refreshed token
- If refresh fails: clears all tokens and redirects to `/sec/login`

---

## 2. API Namespaces

The backend is organized into separate API namespaces, each serving a different module:

| Namespace | Path Prefix | Module |
|-----------|------------|--------|
| SIS API | `/sis_api/` | Academic management, grades, courses, dashboards |
| Security API | `/sec_api/` | Users, groups, pages, permissions |
| HR Cycles API | `/hr_cycles/api/` | Leave, absences, discipline |
| Structure API | `/structure/api/` | Persons, organizations, master data |

**Full endpoint example:**
```
GET https://localhost:8152/sis_api/Course?academicLevelId=1
```

---

## 3. Using the API Wrappers

All API calls in the application go through the wrapper functions in `src/utilities/fetchApi.js`. These wrappers automatically:

- Attach the Authorization header with the current JWT token
- Add the Accept-Language header for the selected locale
- Handle success/error toasts (can be disabled per call)
- Return the response data directly

### Wrapper Function Signatures

```javascript
// GET — fetch data with optional query parameters
apiGet(endpoint, params?, disableToast?)

// POST — create a new record
apiPost(endpoint, payload, disableToast?)

// PUT — replace/update a complete record
apiPut(endpoint, payload, disableToast?)

// PATCH — partial update of a record
apiPatch(endpoint, payload, disableToast?)

// DELETE — remove a record
apiDelete(endpoint, disableToast?)
```

### Usage Examples

```javascript
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@utilities/fetchApi'

// Fetch all courses for an academic level
const courses = await apiGet('/sis_api/Course', { academicLevelId: 1 })

// Create a new course
const newCourse = await apiPost('/sis_api/Course', {
  name: 'Mathematics',
  code: 'MATH101',
  creditHours: 3,
  categoryId: 1
})

// Update a course
await apiPut('/sis_api/Course/5', {
  name: 'Advanced Mathematics',
  code: 'MATH201',
  creditHours: 4,
  categoryId: 1
})

// Partial update
await apiPatch('/sis_api/Course/5', { status: 'Active' })

// Delete a record
await apiDelete('/sis_api/Course/5')

// Fetch without triggering a toast notification
const data = await apiGet('/sis_api/Dashboard/kpis', {}, true)
```

### The `disableToast` Parameter

By default, successful POST/PUT/DELETE operations trigger a success toast notification, and errors trigger an error toast. Pass `true` as the last argument to suppress toasts (useful for background data fetching or custom error handling):

```javascript
// No toast on success or error
const result = await apiGet('/sis_api/Student', { levelId: 2 }, true)
```

---

## 4. Common Endpoint Patterns

Most resources follow RESTful conventions:

| Operation | Method | URL Pattern | Example |
|-----------|--------|------------|---------|
| List all | GET | `/api/Resource` | `GET /sis_api/Course` |
| List with filter | GET | `/api/Resource?param=value` | `GET /sis_api/Course?levelId=1` |
| Get by ID | GET | `/api/Resource/{id}` | `GET /sis_api/Course/5` |
| Create | POST | `/api/Resource` | `POST /sis_api/Course` |
| Update | PUT | `/api/Resource/{id}` | `PUT /sis_api/Course/5` |
| Partial update | PATCH | `/api/Resource/{id}` | `PATCH /sis_api/Course/5` |
| Delete | DELETE | `/api/Resource/{id}` | `DELETE /sis_api/Course/5` |

---

## 5. Request Headers

Every API request automatically includes these headers:

| Header | Value | Source |
|--------|-------|--------|
| `Authorization` | `Bearer {accessToken}` | localStorage `accessToken` |
| `Accept-Language` | `ar` or `en` | localStorage `selectedLocale` |
| `Content-Type` | `application/json` | Default for all JSON requests |

---

## 6. Response & Error Handling

### Success Response Structure

The API returns data directly. The wrapper extracts `response.data` automatically:

```javascript
// Typical list response
{
  data: [
    { id: 1, name: "Mathematics", code: "MATH101", ... },
    { id: 2, name: "Physics", code: "PHYS101", ... }
  ],
  totalCount: 2
}

// Typical single-item response
{
  id: 5,
  name: "Mathematics",
  code: "MATH101",
  creditHours: 3,
  status: "Active"
}
```

### Error Response Handling

The API client handles errors centrally via response interceptors:

| HTTP Status | Meaning | Automatic Action |
|-------------|---------|----------------|
| **300** | Server-side validation error | Show validation message from response body in error toast |
| **401** | Unauthorized (token expired or invalid) | 1. Attempt silent token refresh via `refreshToken`  2. Retry original request with new token  3. If retry fails → clear all tokens → redirect to `/sec/login` |
| **403** | Forbidden (insufficient permissions) | Redirect to the No Access page `/sec/no-access` |
| **404** | Resource not found | Show "Not Found" error toast |
| **5xx** | Server error | Show generic error toast with status code |

### Validation Error Format (HTTP 300)

When the server returns a validation error, the response body contains the error message to display:

```json
{
  "message": "Grade cannot exceed the maximum allowed value for this division",
  "field": "earnedGrade",
  "code": "VALIDATION_ERROR"
}
```

### Disabling Default Error Handling

In some cases (e.g., expected 404s, custom error UI), you may want to handle errors manually. Pass `disableToast: true` and wrap the call in a try/catch:

```javascript
try {
  const result = await apiGet('/sis_api/Student/999', {}, true)
} catch (error) {
  if (error.response?.status === 404) {
    // Handle not found case in component
  }
}
```

---

## 7. Endpoint Reference by Module

### 7.1 SIS API Endpoints (`/sis_api/`)

#### Academic Configuration

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Academic Years | `/sis_api/AcademicYear` | CRUD |
| Academic Levels | `/sis_api/AcademicLevel` | CRUD; filter by year |
| Academic Regulations | `/sis_api/AcademicRegulation` | CRUD; linked to level |
| Enrollment Types | `/sis_api/EnrollmentType` | CRUD lookup table |
| Periods | `/sis_api/Period` | Time slot definitions |
| Rooms | `/sis_api/Room` | Classroom definitions |
| Sections | `/sis_api/Section` | Student group sections |

#### Course Management

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Courses | `/sis_api/Course` | CRUD + filter by level |
| Course Categories | `/sis_api/CourseCategory` | Lookup table |
| Course Types | `/sis_api/CourseType` | Lookup table |
| Degree Divisions | `/sis_api/DegreeDivision` | Grade components per course |
| Lecture Schedule | `/sis_api/LectureSchedule` | Course timetable slots |
| Group Schedule | `/sis_api/GroupSchedule` | Student group assignments |

#### Grade Management

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Final Grades | `/sis_api/FinalGrade` | Grade entry per student per division |
| Grade Scales | `/sis_api/GradeScale` | Letter grade and GPA point configuration |
| Grade Change Log | `/sis_api/GradeChangeLog` | Audit trail; filter by year/level/student/course |
| Student Grades by Division | `/sis_api/StudentGradesByDivision` | Report view |
| Course Grade Analysis | `/sis_api/CourseGradeAnalysis` | Distribution report |

#### Results & Pass/Fail

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Pass/Fail Results | `/sis_api/PassFail` | Result calculation and listing |
| Pass/Fail Regulations | `/sis_api/PassFailRegulation` | Rule configuration |
| Academic Level Results | `/sis_api/AcademicLevelResults` | Cohort-level result summary |
| Exam Results Analysis | `/sis_api/ExamResultsAnalysis` | Statistical breakdown |

#### Attendance & Discipline

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Course Attendance | `/sis_api/CourseAttendance` | Per-session attendance records |
| Attendance Discipline Grades | `/sis_api/AttendanceDisciplineGrades` | Conduct grades |

#### Student Management

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Student Enrollment | `/sis_api/StudentEnrollment` | Enrollment management |
| Student Distribution | `/sis_api/StudentDistribution` | Distribution report |
| Warnings | `/sis_api/Warning` | Warning rules and flagged students |
| Fitness | `/sis_api/Fitness` | Fitness exercises and scores |

#### Dashboards

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Admin Dashboard | `/sis_api/AdminDashboard` | KPIs, charts, trends |
| Institute Dashboard | `/sis_api/InstituteDashboard` | Attendance, incidents, at-risk |
| Audit Dashboard | `/sis_api/AuditDashboard` | Heatmap, alerts, compliance |
| Operational Dashboard | `/sis_api/OperationalDashboard` | 7-tab multi-domain data |

#### Voting

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Voting Polls | `/sis_api/VotingPoll` | Poll CRUD and results |
| Voting Groups | `/sis_api/VotingGroup` | Group definitions |
| Votes | `/sis_api/Vote` | Submit and retrieve votes |

---

### 7.2 Security API Endpoints (`/sec_api/`)

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Users | `/sec_api/User` | User management |
| Security Groups | `/sec_api/Group` | Group CRUD |
| Pages | `/sec_api/Page` | Page/route registry |
| Modules | `/sec_api/Module` | Module enable/disable |
| Permissions | `/sec_api/Permission` | Group-to-page permission assignments |
| Page Tree | `/sec_api/PageTree` | Fetched at login; drives navigation |

---

### 7.3 Structure API Endpoints (`/structure/api/`)

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Students | `/structure/api/Student` | Student profiles |
| Instructors | `/structure/api/Instructor` | Teaching staff profiles |
| Managers | `/structure/api/Manager` | Administrative staff |
| Organization | `/structure/api/Organization` | Hierarchy nodes |
| Blood Types | `/structure/api/BloodType` | Lookup |
| Religions | `/structure/api/Religion` | Lookup |
| Nationalities | `/structure/api/Nationality` | Lookup |
| Governates | `/structure/api/Governate` | Lookup |
| Military Ranks | `/structure/api/MilitaryRank` | Lookup |
| Batches | `/structure/api/Batch` | Intake cohort lookup |
| Qualifications | `/structure/api/Qualification` | Lookup |
| Jobs | `/structure/api/Job` | Lookup |
| Housing | `/structure/api/Housing` | Lookup |

---

### 7.4 HR Cycles API Endpoints (`/hr_cycles/api/`)

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Leave Requests | `/hr_cycles/api/LeaveRequest` | Submit and manage leave |
| Leave Balance | `/hr_cycles/api/LeaveBalance` | Employee leave balance |
| Leave Request Groups | `/hr_cycles/api/LeaveRequestGroup` | Batch leave groups |
| Student Absences | `/hr_cycles/api/StudentAbsence` | Absence aggregation |
| Office Summons | `/hr_cycles/api/OfficeSummons` | Summons management |
| Incidents | `/hr_cycles/api/Incident` | Discipline incidents |
| Punishments | `/hr_cycles/api/Punishment` | Punishment records |
| Punishment Types | `/hr_cycles/api/PunishmentType` | Lookup table |
| Job Punishment Authority | `/hr_cycles/api/JobPunishmentAuthority` | Authority validation |

---

## Query Parameter Conventions

Common query parameters used across the API:

| Parameter | Type | Description |
|-----------|------|-------------|
| `academicYearId` | integer | Filter by academic year |
| `academicLevelId` | integer | Filter by academic level |
| `semesterId` | integer | Filter by semester |
| `courseId` | integer | Filter by specific course |
| `studentId` | integer | Filter by specific student |
| `sectionId` | integer | Filter by section/group |
| `pageNumber` | integer | Pagination: page index (usually 1-based) |
| `pageSize` | integer | Pagination: records per page |
| `sortBy` | string | Column to sort by |
| `sortDirection` | string | `asc` or `desc` |
| `fromDate` | string (ISO 8601) | Date range start |
| `toDate` | string (ISO 8601) | Date range end |

---

*For full business context and workflow documentation, see [SIS-FRONT-DOCUMENTATION.md](./SIS-FRONT-DOCUMENTATION.md).*
