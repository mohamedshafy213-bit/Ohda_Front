---
trigger: always_on
---

---

## alwaysApply: true

# check for /.agent/AGENT_MEMORY.md before start any new job

# Vue 3 Project Rules - SIS (Student Information System)

## Project Overview

This is a Vue 3 management frontend (SIS) with modular architecture, internationalization (Arabic/English), and enterprise-grade features.

## Tech Stack & Architecture

### Core Technologies

- **Vue 3** with Composition API and `<script setup>` syntax
- **Vite 7** as build tool with hot module replacement
- **Pinia 3** for state management
- **Vue Router 4** for routing
- **PrimeVue 4** (unstyled mode) + **Tailwind CSS v4** for UI
- **Vue I18n** for internationalization (Arabic RTL / English LTR)
- **VeeValidate + Yup** for form validation
- **Axios** for HTTP requests with interceptors
- **Electron** for desktop application support

### Project Structure

```
src/
├── assets/           # Static assets, icons, images
├── components/       # Shared UI components
│   └── validationFields/  # VeeValidate form components
├── i18n/            # Internationalization setup
├── layouts/         # Layout components (main, sidebar, topbar)
├── projects/        # Feature modules (domain-driven)
│   ├── authentication/  # Login, access control
│   ├── sis/             # Patient management module
│   └── structure/       # Organization structure
├── router/          # Vue Router configuration
├── stores/          # Global Pinia stores
├── utilities/       # Shared utilities (API, validations, helpers)
└── volt/            # Custom UI component library (PrimeVue wrappers)
```

## Coding Standards & Patterns

### Component Structure

- **Always use `<script setup>`** syntax for all Vue components
- **Template structure**: `<template>` → `<script setup>` → `<style scoped>`
- **Single file components** with `.vue` extension
- **PascalCase** for component filenames (`PatientDetails.vue`)

### Naming Conventions

- **Files**: PascalCase for components (`ReceptionTable.vue`), camelCase for utilities (`fetchApi.js`)
- **Components**: PascalCase (`PatientDialog`, `DateRangeSelector`)
- **Stores**: camelCase with `use` prefix (`useBaseStore`, `useReceptionStore`)
- **Functions**: camelCase (`getUserPages`, `formatDate`)
- **Variables**: camelCase (`patientData`, `dateRange`)

### Auto-imports Configuration

The project uses `unplugin-auto-import` with these auto-imported modules:

- Vue Composition API (`ref`, `computed`, `watch`, `onMounted`, etc.)
- Vue Router (`useRouter`, `useRoute`)
- Vue I18n (`useI18n`)
- VeeValidate (`useForm`, `useField`)
- Pinia stores from `src/stores/`
- Utilities from `src/utilities/`
- Volt components from `src/volt/`
- PrimeVue `useToast`

**Note:** Due to auto-imports, you don't need to manually import these in components.

## State Management (Pinia)

### Store Structure

- **Global stores**: Located in `src/stores/`
- **Module stores**: Located in `src/projects/[module]/stores/`
- **Naming pattern**: `use[Feature]Store`

### Store Template

```javascript
import { defineStore } from "pinia";
import { apiGet, apiPost } from "@/utilities/fetchApi.js";

export const useFeatureStore = defineStore("feature", {
  state: () => ({
    data: [],
    loading: false,
  }),
  actions: {
    async fetchData() {
      this.loading = true;
      const response = await apiGet("/endpoint");
      this.data = response.data;
      this.loading = false;
    },
  },
});
```

## Utilities (`src/utilities/`)

### API Integration

#### `apiClient.js` - Axios Configuration

- Base Axios instance with interceptors
- Automatic Bearer token injection from `localStorage.accessToken`
- Accept-Language header from `localStorage.selectedLocale`
- Global error handling with toast notifications
- Response interceptors for 401/403/404 status handling

#### `fetchApi.js` - API Wrapper Functions

```javascript
// Available functions (auto-imported)
apiGet(endpoint, options); // GET request
apiPost(endpoint, data, toast); // POST request (toast: boolean)
apiPut(endpoint, data, toast); // PUT request
apiDelete(endpoint, options, toast); // DELETE request
apiPatch(endpoint, data, toast); // PATCH request
```

**Usage:**

```javascript
// In stores or components
const response = await apiGet("/patients/list");
await apiPost("/patients/create", patientData);
await apiPost("/endpoint", data, false); // Disable success toast
```

### Validation Functions (`validations.js`)

Pre-built Yup validation schemas:

```javascript
validateEmail(); // Email validation
validateName(); // Name with Arabic/English support
validateId(); // UUID validation
validatePassword(); // Password with requirements
validatePasswordConfirmation();
validateNumber(); // Numeric validation
validateCode(); // Alphanumeric code
validateDate(); // Date not in future
validateBoolean(); // Boolean required
validateMobile(); // International phone format
validateText(); // Text with length limits
```

**REGEX_PATTERNS** object available for custom validations:

- `email`, `mobile`, `name`, `code`, `userName`, `password`, `id`

### Helper Functions (`functions.js`)

Locale-aware formatting utilities:

```javascript
formatDate(date, formatString); // Date formatting (Arabic/English)
formatTime(date, formatString); // Time formatting
formatNumber(number, formatString); // Number formatting with locale
```

### File Processing (`fileProcessor.js`)

Utilities for file handling and processing.

## Form Validation

### Validation Components (`src/components/validationFields/`)

Pre-built VeeValidate components:

- `InputTextValid.vue` - Text input with validation
- `SelectValid.vue` - Dropdown with validation
- `DatePickerValid.vue` - Date picker with validation
- `TextareaValid.vue` - Textarea with validation
- `CheckboxValid.vue` - Checkbox with validation
- `FileUploadValid.vue` - File upload with validation
- `SelectButtonValid.vue` - Button group with validation

**Usage:**

```vue
<template>
  <Form @submit="onSubmit">
    <InputTextValid name="patientName" />
    <SelectValid name="department" :options="departments" />
  </Form>
</template>
```

## Volt Component Library (`src/volt/`)

Custom PrimeVue wrapper components styled with Tailwind CSS:

- `Button.vue`, `SecondaryButton.vue`, `ContrastButton.vue`
- `InputText.vue`, `Textarea.vue`, `Select.vue`, `MultiSelect.vue`
- `DatePicker.vue`, `Checkbox.vue`, `ToggleSwitch.vue`
- `DataTable.vue`, `Tree.vue`
- `Dialog.vue`, `Popover.vue`, `Toast.vue`
- `Tabs.vue`, `Tab.vue`, `TabList.vue`, `TabPanel.vue`, `TabPanels.vue`
- `FileUpload.vue`, `InputOtp.vue`, `SelectButton.vue`

**Note:** Volt components are auto-imported.

## Icons (`src/assets/icons/icons.js`)

### Global Icon Registration

Icons are globally registered from `lucide-vue-next` in `src/assets/icons/icons.js`. They are available in all components without import.

### Usage

```vue
<template>
  <!-- Use icons directly in templates - no import needed -->
  <User class="w-4 h-4" />
  <Search class="w-5 h-5 text-surface-500" />
  <Trash class="w-4 h-4 text-red-500" />
</template>

<script setup>
// No import needed - icons are globally registered
</script>
```

### Adding New Icons

To add a new icon:

1. Import it in `src/assets/icons/icons.js`:

```javascript
import { NewIcon } from "lucide-vue-next";
```

2. Register it in the `importIcons` function:

```javascript
app.component("NewIcon", NewIcon);
```

### Available Icons

Common icons include: `User`, `Users`, `UserPlus`, `UserX`, `Search`, `Plus`, `Trash`, `Pencil`, `Save`, `Eye`, `Calendar`, `Phone`, `Mail`, `ArrowRight`, `ArrowLeft`, `GraduationCap`, `FileText`, `LayoutGrid`, `List`, `Camera`, and many more.

**Important:** Do NOT import icons from `lucide-vue-next` directly in components. Always use the global registration.

## Internationalization (i18n)

### Configuration

- **Supported locales**: Arabic (`ar` - RTL, default) and English (`en` - LTR)
- **Locale files**: `src/i18n/constants.js` and `src/i18n/index.js`
- **Module translations**: `src/projects/[module]/translations/`
- **Persistence**: `localStorage.selectedLocale`

### Usage

```vue
<template>
  {{ $t("patient.name") }}
</template>

<script setup>
const { t, locale } = useI18n();
const message = t("patient.name");
</script>
```

## Routing

### Structure

- **Global routes**: `src/router/index.js`
- **Module routes**: `src/projects/[module]/router.js`

### Route Pattern

```javascript
// src/projects/sis/router.js
export default [
  {
    path: "/reception",
    name: "reception",
    component: () => import("./pages/ReceptionPage.vue"),
  },
];
```

## Styling

### Tailwind CSS v4

- Configured via `@tailwindcss/vite` plugin
- PrimeVue in unstyled mode - all styling via Tailwind
- Dark mode support via VueUse `useDark`
- RTL support automatic with locale switching

### CSS Utilities

- `tw-animate-css` for animations
- `tailwindcss-primeui` for PrimeVue integration
- `tailwind-merge` and `clsx` for class management

### Required Field Indicator

To mark a form field as required, add the `required` class to the label element. This automatically appends a red asterisk (\*) after the label text.

**CSS Definition** (in `src/assets/main.css`):

```css
.required::after {
  content: " *";
  color: #ef4444; /* text-red-500 */
}
```

**Usage:**

```vue
<label
  class="text-sm font-medium text-surface-700 dark:text-surface-300 required"
>
    {{ $t("fieldName") }}
</label>
```

**Important:** Do NOT use inline `<span class="text-red-500">*</span>` for required indicators. Always use the `required` class.

## Project Module Structure

Each module in `src/projects/` follows this structure:

```
[module]/
├── pages/          # Page components
├── stores/         # Module-specific Pinia stores
├── translations/   # Module translations
└── router.js       # Module routes
```

## Environment Variables

```
VITE_ROOT_URL       # API base URL
VITE_IDENTITY_URL   # Identity server URL
VITE_SEC_URL        # Security service URL
VITE_BASE_PATH      # Base path for Electron
```

## Best Practices

1. **Always use `<script setup>`** - Do not use Options API
2. **Use auto-imports** - Don't manually import Vue, router, store utilities
3. **Use Volt components** - Prefer over raw PrimeVue for consistency
4. **Use validation components** - For forms, use `*Valid.vue` components
5. **Use utility functions** - `apiGet/apiPost` over raw axios
6. **Follow naming conventions** - PascalCase components, camelCase functions
7. **Handle errors gracefully** - API errors are auto-handled by interceptors
8. **Support RTL** - Use logical CSS properties (`start`/`end` vs `left`/`right`)
9. **Use formatters** - `formatDate`, `formatNumber` for locale-aware display
10. **Follow the modular architecture** for better maintainability
11. **Prefer defineModel over watch** for two-way binding and prop synchronization# Vue 3 Project Rules - Correspondence Management System

## Development Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run electron   # Run Electron desktop app
```

## Node Version

Required: `^20.19.0 || >=22.12.0`
