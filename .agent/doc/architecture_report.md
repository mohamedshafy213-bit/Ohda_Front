# SIS-Front Application Architecture Report

## 1. High-Level Architecture

The application follows a **Modular Monolith** pattern using Vue 3. Features are organized by **Domain/Module** rather than technical type, promoting scalability and separation of concerns.

### Folder Structure Analysis

- **`src/projects/`**: This is the core of the architecture. Each subdirectory represents a distinct business module (e.g., `sis`, `hr_cycles`, `structure`, `security`).
  - Each project folder contains its own `pages`, `stores`, `router.js`, and `translations`, making them self-contained units.
- **`src/stores/`**: Contains global application state (e.g., `baseStore` for navigation/auth, `toastStore` for notifications) that cuts across modules.
- **`src/utilities/`**: Shared tech-agnostic logic (API clients, validators, formatters).
- **`src/volt/`**: A custom wrapper layer around PrimeVue components, likely ensuring consistent styling (Tailwind) and behavior across the app.

## 2. Business Workflow & Features

The application is a comprehensive **Student Information & HR Management System**. It manages the lifecycle of students, staff, and organizational structures.

### Core User Journeys

Based on the router configurations, the application supports distinct personas:

#### A. Academic Administration (SIS Module)

- **Journey**: `Configuration -> Enrollment -> Course Management -> Grading -> Reporting`
- **Key Workflows**:
  - **Setup**: Defining Academic Years, Levels, Rooms, and Grade Scales.
  - **Course Mgmt**: Managing Course Categories, Types, and assigning Courses.
  - **Scheduling**: Managing Periods, Sections, and Lecture/Group Schedules.
  - **Assessment**: Recording Attendance, Analyzing Grades, and issuing Warnings.

#### B. Organizational Structure & Personnel (Structure Module)

- **Journey**: `Hierarchy Setup -> Person Onboarding -> Data Management`
- **Key Workflows**:
  - **Hierarchy**: Managing the institutional tree.
  - **Person 360**: CRUD operations for **Managers**, **Students**, and **Teaching Staff**.
  - **Main Data**: Managing lookups like Blood Types, Religions, Military Ranks, Housing.

#### C. HR & Discipline (HR Cycles Module)

- **Journey**: `Request -> Approval Cycle -> Balance Update`
- **Key Workflows**:
  - **Leaves/Missions**: Employees submit requests (Agaza, Mission, Clinic) -> Managers approve -> Balances invoke.
  - **Discipline**: Managing Punishment data and Warning rules.
  - **Recruitment**: Managing Jobs, Requirements, and Hiring processes.

#### D. Security & Access Control (Security Module)

- **Journey**: `Identity Mgmt -> Access Delegation`
- **Key Workflows**:
  - **Identity**: Managing Users and Groups.
  - **Access**: Assigning specific Module/Page permissions to groups.

## 3. Data & State Management Strategy

### State Management (Pinia)

The application uses a **Tiered Store Pattern**:

1.  **Global Stores (`src/stores`)**:
    - **`useBaseStore`**: Acts as the backbone. It handles:
      - **User Session**: Stores user profile and permissions.
      - **Navigation**: Dynamic `menuModel` (bilingual) and `pageTree` generation based on permissions.
      - **Routing Logic**: `getUserPages` fetches the allowed routes tree from the backend.
    - **`useToastStore`**: Global notification state.
2.  **Module Stores (`src/projects/*/stores`)**:
    - Each feature has dedicated stores (e.g., `academicYearStore`, `hrAgazaStore`).
    - These stores likely encapsulate CRUD logic specific to that domain.

### Data Flow

1.  **UI Component** triggers an action (e.g., `onMounted` calls `store.fetchData`).
2.  **Store Action** calls a wrapper function from `src/utilities/fetchApi.js` (e.g., `apiGet`).
3.  **API Client (`src/utilities/apiClient.js`)**:
    - **Interceptors**:
      - **Request**: Injects `Authorization: Bearer <token>` and `Accept-Language` headers. Handles Token Refresh (`refreshAccessToken`) automatically if the token is expiring.
      - **Response**: Global Error Handling (401 -> Redirect/Refresh, 403 -> Toast). Success messages are automatically toasted via `toastStore` unless disabled.
4.  **Backend**: Returns JSON data.
5.  **Store**: Mutates state (`this.data = response.data`).
6.  **UI**: Reactively updates.

### Key Business Entities

- **Person**: The base entity for Students, Managers, and Teaching Staff.
- **Academic Year / Level**: Time and progression delimiters.
- **Course**: The central academic unit.
- **Request (Agaza/Mission)**: HR workflow entities.

## 4. Tech Stack Summary

The project utilizes a modern, performance-oriented stack:

| Category       | Library                                | Purpose in Context                                                                                                                                       |
| :------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**  | **Vue 3** (Composition API)            | Modern reactive UI framework.                                                                                                                            |
| **Build Tool** | **Vite 7**                             | Extremely fast hot-reload and building.                                                                                                                  |
| **State**      | **Pinia 3**                            | Lightweight, modular state management (replaces Vuex).                                                                                                   |
| **UI Library** | **PrimeVue ISO** + **Tailwind CSS v4** | PrimeVue provides complex logic (Tables, Pickers) in "Unstyled Mode", while Tailwind handles the visual design system, ensuring a custom "Premium" look. |
| **Routing**    | **Vue Router 4**                       | Client-side routing with dynamic permission checking.                                                                                                    |
| **Validation** | **Vee-Validate** + **Yup**             | Schema-based form validation, essential for the complex data entry forms in SIS/HR.                                                                      |
| **Charts**     | **Chart.js** / **vue-chartjs**         | Visualizing academic results and HR stats in dashboards.                                                                                                 |
| **Utils**      | **VueUse**, **date-fns**, **Axios**    | Standard toolkit for reactive primitives, date manipulation, and HTTP.                                                                                   |
| **Platform**   | **Electron**                           | Enables the web app to run as a native desktop application, likely for administrative staff usage.                                                       |
