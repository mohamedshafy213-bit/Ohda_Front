# SIS Project Development Guide

This guide serves as a comprehensive reference for developing within the SIS (Student Information System) project. It encapsulates architectural decisions, coding standards, and common workflows.

## 1. Project Overview & Architecture

**Goal**: A modular, enterprise-grade hospital/patient management frontend with internationalization (Ar/En).

### Tech Stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Build**: Vite 7
- **State**: Pinia 3
- **Routing**: Vue Router 4
- **UI Library**: PrimeVue 4 (Unstyled) + Tailwind CSS v4
- **Forms**: VeeValidate + Yup
- **HTTP**: Axios
- **I18n**: Vue I18n

### Directory Structure

The project follows a **Domain-Driven Design (DDD)** approach, primarily within the `projects/` directory.

- `src/projects/`: Contains feature modules (e.g., `sis`, `authentication`, `structure`).
  - Each module contains its own `pages/`, `stores/`, `router.js`, and `translations/`.
- `src/volt/`: Custom, unstyled PrimeVue components wrapped with Tailwind CSS. **Always use these instead of raw PrimeVue components.**
- `src/components/`: Shared application-wide components.
  - `validationFields/`: Reusable form inputs with built-in validation.
- `src/stores/`: Global application state (e.g., `baseStore`, `toastStore`).
- `src/utilities/`: Shared helpers (`apiClient.js`, `validations.js`, `functions.js`).

## 2. Core Development Patterns

### A. Component Implementation

- **Syntax**: Always use `<script setup>`.
- **Naming**: PascalCase for files and components (e.g., `StudentDetails.vue`).
- **Imports**: Rely on **auto-imports** for Vue core, Router, Pinia, and utility functions. Do not manually import `ref`, `computed`, `useRouter`, `apiGet`, etc.

### B. State Management (Pinia)

- **Location**: Module-specific stores go in `src/projects/[module]/stores/`.
- **Pattern**: Options API style for defining stores is preferred in this project (state, actions, getters).
- **Usage**: Feature-specific logic should reside in stores, keeping components clean.

### C. API Interaction

**Never use raw Axios.** Use the provided wrappers in `src/utilities/fetchApi.js`:

```javascript
// GET
const response = await apiGet("/endpoint");

// POST (with success toast by default)
await apiPost("/endpoint", payload);

// POST (without success toast)
await apiPost("/endpoint", payload, false);
```

### D. Form Validation

Use the components in `src/components/validationFields/` which integrate VeeValidate and Yup.

```vue
<template>
  <Form @submit="onSubmit">
    <InputTextValid name="email" label="Email" />
    <Button type="submit">Submit</Button>
  </Form>
</template>
```

### E. Styling & UI

- **Tailwind CSS**: Used for all styling.
- **Volt Components**: Use components from `src/volt/` (e.g., `<Button>`, `<InputText>`, `<Dialog>`). They are pre-styled and consistent.
- **Icons**: Icons (Lucide) are globally registered. Use them directly: `<User class="w-4 h-4" />`.

## 3. Common Workflows (Cookbook)

### H. How to Create a New CRUD Module

1.  **Create Directory**: `src/projects/[module_name]/`
2.  **Create Store**: `src/projects/[module_name]/stores/use[Entity]Store.js`
3.  **Create Pages**:
    - `pages/[Entity]List.vue`: DataTable with actions.
    - `pages/[Entity]Form.vue` or Dialog: Form for Create/Edit.
4.  **Define Routes**: Add to `src/projects/[module_name]/router.js`.
5.  **Add Translations**: Update `src/projects/[module_name]/translations/[en|ar].json`.
6.  **Register Module**: Ensure the module's router is imported in the main app router.

### I. How to Add a Navigation Item

1.  Open the sidebar configuration (usually in `src/layouts` or a config file).
2.  Add the route name and icon.
3.  Ensure the route exists in the module's `router.js`.

### J. How to Handle Internationalization

- Use `$t('key')` in templates.
- Use `t('key')` in script setup (global `t` is available or `const { t } = useI18n()`).
- **RTL/LTR**: Use logical CSS properties (`ms-2`, `me-2` instead of `ml-2`, `mr-2`) or Tailwind's `rtl:` modifier.

## 4. Key Rules Check

- [ ] Are you using `<script setup>`?
- [ ] Did you check `src/volt` before creating a generic UI component?
- [ ] Are API calls using `apiGet`/`apiPost`?
- [ ] Is exact styling done with Tailwind utility classes?
- [ ] Are form inputs using `*Valid` components?

---

_Reference: See `.agent/rules/vue-rules.md` for the strict ruleset._
