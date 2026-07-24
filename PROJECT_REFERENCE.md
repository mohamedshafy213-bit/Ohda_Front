# SIS Frontend — Complete Project Reference

> Use this file as the single source of truth when starting, editing, or extending the project.

---

## 1. Project Identity

| Property | Value |
|---|---|
| Name | SIS (Student Information System) |
| Domain | Academic / Military institute management |
| Languages | Arabic (default, RTL) + English (LTR) |
| Target | Web + PWA + Electron desktop |

---

## 2. Tech Stack

| Layer | Library / Tool | Version |
|---|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) | ^3.5 |
| Build | Vite | ^7.1 |
| State | Pinia | ^3.0 |
| Routing | Vue Router | ^4.6 |
| UI primitives | PrimeVue 4 — **unstyled mode** | ^4.5 |
| Styling | Tailwind CSS v4 | ^4.1 |
| PrimeVue+TW bridge | tailwindcss-primeui | ^0.6 |
| Form validation | VeeValidate + Yup | ^4 / ^1 |
| HTTP | Axios (wrapped — never use raw) | ^1.12 |
| i18n | Vue I18n | ^11 |
| Icons | Lucide Vue Next (globally registered) | ^0.563 |
| Charts | Chart.js + vue-chartjs | ^4 / ^5 |
| Calendar UI | vue-cal | ^5 rc |
| Drag & drop | vuedraggable | ^4 |
| Date utils | date-fns / date-fns-tz | ^4 / ^3 |
| Utilities | @vueuse/core, @vueuse/integrations | ^13 |
| Auth | Keycloak (JWT + refresh token) | — |
| PWA | vite-plugin-pwa | ^1 |
| Desktop | Electron + electron-builder | ^38 |
| Auto-imports | unplugin-auto-import + unplugin-vue-components | — |
| Dev tools | eslint, eslint-plugin-vue, vite-plugin-vue-devtools | — |

---

## 3. Directory Structure

```
src/
├── main.js                  # App bootstrap (PrimeVue, Pinia, Router, i18n, icons)
├── App.vue                  # Root component
├── assets/
│   ├── main.css             # Global CSS + Tailwind entry
│   └── icons/icons.js       # Lucide icon global registration
├── i18n/
│   ├── index.js             # i18n instance + setLocale() + supportedLocales
│   └── constants.js         # Shared translation constants (active, inactive, actions…)
├── router/
│   └── index.js             # Root router — composes module routers
├── stores/
│   ├── baseStore.js         # Global state: menuModel, user, entity config, breadcrumbs
│   └── toastStore.js        # Toast notification helpers
├── utilities/
│   ├── apiClient.js         # Axios instance + Keycloak interceptors
│   ├── fetchApi.js          # apiGet / apiPost / apiPut / apiDelete / apiPatch
│   ├── functions.js         # formatDate / formatTime / formatNumber / extractBirthDate…
│   ├── validations.js       # Shared Yup helpers
│   ├── exports.js           # Re-exports for Module Federation
│   └── fileProcessor.js     # File upload helpers
├── volt/                    # ⭐ Custom Tailwind-styled PrimeVue wrappers — USE THESE
│   ├── Button.vue
│   ├── SecondaryButton.vue
│   ├── ContrastButton.vue
│   ├── InputText.vue
│   ├── InputNumber.vue
│   ├── Select.vue
│   ├── MultiSelect.vue
│   ├── AutoComplete.vue
│   ├── Textarea.vue
│   ├── Checkbox.vue
│   ├── SelectButton.vue
│   ├── DatePicker.vue
│   ├── Dialog.vue
│   ├── DataTable.vue
│   ├── TreeTable.vue
│   ├── Tree.vue
│   ├── TreeSelect.vue
│   ├── Tab.vue / TabList.vue / TabPanel.vue / TabPanels.vue / Tabs.vue
│   ├── FileUpload.vue
│   ├── Skeleton.vue
│   ├── Popover.vue
│   ├── Listbox.vue
│   ├── InputOtp.vue
│   ├── Knob.vue
│   ├── OrganizationChart.vue
│   ├── Timeline.vue
│   ├── Divider.vue
│   ├── ToggleSwitch.vue
│   ├── Toast.vue
│   └── utils.ts             # ptViewMerge utility
├── components/              # Shared application-wide components
│   ├── validationFields/    # Form inputs with built-in VeeValidate integration
│   │   ├── InputTextValid.vue
│   │   ├── InputNumberValid.vue
│   │   ├── SelectValid.vue
│   │   ├── SelectButtonValid.vue
│   │   ├── TextareaValid.vue
│   │   └── FileUploadValid.vue
│   ├── SearchField.vue
│   ├── Breadcrumb.vue
│   ├── Paginator.vue
│   ├── DeleteButtonPrompt.vue   # Delete with inline confirm
│   ├── DeleteDialog.vue
│   ├── ConfirmDialog.vue
│   ├── EditButton.vue
│   ├── DeleteButton.vue
│   ├── ViewButton.vue
│   ├── LoadingSection.vue
│   ├── LoadingSpinner.vue
│   ├── ErrorHandelerMassage.vue
│   ├── CustomStepper.vue
│   ├── CustomTree.vue
│   ├── BlockingRecordsDialog.vue
│   ├── NotesViewDialog.vue
│   ├── InterruptTimelineDialog.vue
│   ├── themeSwitch.vue
│   ├── I18nSwitch.vue
│   ├── notificationMenu.vue
│   ├── dateRangeSelector.vue
│   ├── pdf.vue
│   └── voiceToText.vue
├── layouts/
│   ├── mainLayoutWithSidebar.vue   # Authenticated layout (navbar + sidebar)
│   ├── loginLayout.vue             # Unauthenticated layout
│   ├── navBar.vue
│   └── sideBar.vue / sidebar/      # Sidebar with menu model
└── projects/                # ⭐ Domain modules — main feature code lives here
    ├── sis/                 # Student Information System features
    │   ├── pages/           # 30+ feature pages (academicYears, courses, sections…)
    │   ├── stores/          # Feature-specific Pinia stores
    │   ├── translations/    # EN + AR translation files per feature
    │   ├── enums.js         # Module-level enumerations
    │   └── router.js        # Module routes (mounted at /sis/*)
    ├── structure/           # Organizational hierarchy, employees, lookups
    ├── security/            # Users, groups, permissions, login, roles
    └── hr_cycles/           # Leave, absence, discipline management
```

---

## 4. Path Aliases (vite.config.js)

| Alias | Resolves to |
|---|---|
| `@` | `src/` |
| `@volt` | `src/volt/` |
| `@components` | `src/components/` |
| `@utilities` | `src/utilities/` |
| `@stores` | `src/stores/` |
| `@router` | `src/router/` |
| `@assets` | `src/assets/` |
| `@projects` | `src/projects/` |

---

## 5. Auto-Import Rules

These are **never manually imported** — they are injected by `unplugin-auto-import`:

**From Vue:** `ref`, `computed`, `watch`, `watchEffect`, `onMounted`, `onUnmounted`, `defineProps`, `defineEmits`, `defineModel`, `reactive`, `toRefs`, etc.

**From Vue Router:** `useRouter`, `useRoute`

**From Vue I18n:** `useI18n`

**From VeeValidate:** `useForm`, `useField`

**From PrimeVue:** `useToast`

**From `src/stores/`:** All stores (e.g., `useBaseStore`, `useToastStore`)

**From `src/utilities/`:** `apiGet`, `apiPost`, `apiPut`, `apiDelete`, `apiPatch`, `formatDate`, `formatTime`, `formatNumber`

**From `src/volt/`:** All volt components are auto-registered as global Vue components.

**From `src/components/`:** All components in `src/components/` are auto-registered globally.

> **Rule:** If it comes from these directories — do not write an import for it.

---

## 6. Component Rules

```vue
<!-- ✅ CORRECT -->
<script setup>
// No imports for auto-imported items
const store = useSomeStore()
const count = ref(0)
</script>

<!-- ❌ WRONG -->
<script setup>
import { ref } from 'vue'           // auto-imported
import { useRouter } from 'vue-router' // auto-imported
import Button from '@/volt/Button.vue'  // auto-registered globally
</script>
```

- **Always** use `<script setup>` — never Options API in pages/components.
- **PascalCase** file names: `AcademicYearsPage.vue`, `AddStudentDialog.vue`.
- **Never** use raw PrimeVue components — always use the `src/volt/` wrappers.

---

## 7. API Layer

### fetchApi.js wrappers

```javascript
// GET — returns axios response
const response = await apiGet("/sis_api/Entity")
const items = response.data.objects  // or response.data.data

// POST — shows success toast by default
await apiPost("/sis_api/Entity", payload)

// POST — suppress success toast
await apiPost("/sis_api/Entity", payload, false)

// PUT
await apiPut("/sis_api/Entity", payload)

// DELETE
await apiDelete(`/sis_api/Entity/${id}`)

// PATCH
await apiPatch(`/sis_api/Entity/${id}`, payload)
```

### apiClient.js — What it does automatically

- Attaches `Authorization: Bearer <token>` from localStorage.
- Proactively refreshes Keycloak token when it expires within 45 s.
- Sets `Accept-Language` header from `localStorage.selectedLocale`.
- On **non-GET** success: shows a success toast (`response.data.returnMessage`).
- On **401**: retries with refreshed token; if that fails, redirects to `/login`.
- On **403 / 404**: shows error toast.
- **HTTP 300** = API business/validation error — treated as silent rejection.

### API base URL

Configured via env variable: `VITE_ROOT_URL` (set in `.env` files, not committed).

### Keycloak

| Env variable | Default |
|---|---|
| `VITE_KEYCLOAK_URL` | `https://www.isd-sis.mil/authentication` |
| `VITE_KEYCLOAK_REALM` | `master` |
| `VITE_KEYCLOAK_CLIENT_ID` | `sis` |

---

## 8. State Management (Pinia)

### Store pattern

```javascript
// src/projects/{module}/stores/use{Entity}Store.js
import { defineStore } from "pinia";

export const use{Entity}Store = defineStore("{entity}", {
    state: () => ({
        items: [],
        loading: false,
    }),
    actions: {
        async getItems() {
            this.loading = true;
            try {
                const response = await apiGet("/sis_api/Entity");
                this.items = response.data.objects || [];
            } catch (error) {
                console.error("Error:", error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async createItem(payload) {
            await apiPost("/sis_api/Entity", payload);
            await this.getItems();  // always refresh list after mutation
        },
        async updateItem(payload) {
            await apiPut("/sis_api/Entity", payload);
            await this.getItems();
        },
        async deleteItem(id) {
            await apiDelete(`/sis_api/Entity/${id}`);
            await this.getItems();
        },
    },
});
```

### Global stores

| Store | Purpose |
|---|---|
| `baseStore` | `menuModel`, `user`, `entityConfiguration`, breadcrumbs, page access |
| `toastStore` | `addSuccessToast()`, `addErrorToast()`, `redirectToLogin()` |

### In components

```javascript
// Auto-imported — no import statement needed
const store = useSomeStore()

// Dispose on unmount to free memory
onUnmounted(() => store.$dispose())
```

---

## 9. Form Validation Pattern

```vue
<template>
  <Dialog v-model:visible="visible" title="..." icon="...">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="required">{{ t("field.label") }}</label>
        <InputTextValid name="nameEn" />
      </div>
      <div class="flex flex-col gap-1">
        <label>{{ t("field.select") }}</label>
        <SelectValid name="typeId" :options="types" />
      </div>
      <div class="flex gap-2 justify-center">
        <Button @click="onSubmit()">{{ t("save") }}</Button>
        <SecondaryButton @click="visible = false">{{ t("cancel") }}</SecondaryButton>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import * as yup from "yup";

const { t } = useI18n();
const visible = defineModel("visible");
const editData = defineModel("editData");
const isEdit = computed(() => editData.value != null);

const schema = yup.object().shape({
    nameEn: yup.string().required().max(100),
    nameAr: yup.string().required().max(100),
    typeId: yup.number().required(),
    isActive: yup.boolean().nullable(),
});

const { handleSubmit, setValues, resetForm } = useForm({
    validationSchema: schema,
    initialValues: { nameEn: "", nameAr: "", isActive: true },
});

const onSubmit = handleSubmit((values) => {
    const payload = { ...values };
    if (isEdit.value) {
        payload.id = editData.value.id;
        store.updateItem(payload);
    } else {
        store.createItem(payload);
    }
    visible.value = false;
});

watch(visible, (newValue) => {
    if (newValue && isEdit.value) {
        setValues({ ...editData.value });
    } else if (newValue) {
        resetForm();
    } else {
        editData.value = null;
    }
});
</script>
```

### Validation field components

| Component | Wraps |
|---|---|
| `<InputTextValid name="..." />` | `<InputText>` + `useField` |
| `<InputNumberValid name="..." />` | `<InputNumber>` + `useField` |
| `<SelectValid name="..." :options="[]" />` | `<Select>` + `useField` |
| `<SelectButtonValid name="..." />` | `<SelectButton>` + `useField` |
| `<TextareaValid name="..." />` | `<Textarea>` + `useField` |
| `<FileUploadValid name="..." />` | `<FileUpload>` + `useField` |

> Label required styling: add `class="required"` — CSS adds the red asterisk.

---

## 10. Routing

### Root router (`src/router/index.js`)

Two layout groups:
- **`mainLayoutWithSidebar.vue`** — authenticated pages under `/`
- **`loginLayout.vue`** — unauthenticated pages (`/login`)

Module routes are imported and nested:

```
/structure/*   → structureRoutes
/sec/*         → securityRoutes
/sis/*         → sisRoutes
/hr-cycles/*   → hrCyclesRoutes
```

### Module router pattern (`src/projects/{module}/router.js`)

```javascript
const routes = [
    {
        path: "entity-name",          // relative — parent adds the module prefix
        name: "Entity Name",
        component: () => import("./pages/EntityName/EntityPage.vue"),
    },
    {
        path: "entity-name/:id",      // dynamic segment for detail/edit pages
        name: "Entity Detail",
        component: () => import("./pages/EntityName/EntityDetail.vue"),
    },
];
export default routes;
```

### Route guard

The global `beforeEach` guard (currently partially disabled in dev):
- Checks `localStorage.accessToken` for authentication.
- Calls `baseStore.getUserPages()` to load the user's permitted pages.
- Redirects unauthorized access to `/no-access`.

---

## 11. Internationalization (i18n)

### Setup facts

- Default locale: **Arabic (`ar`)** — RTL document direction.
- Fallback locale: `ar`.
- Locale persisted in `localStorage.selectedLocale`.
- Direction set on `<html dir="rtl|ltr">` at boot and on locale switch.

### Translation file structure

```javascript
// src/projects/{module}/translations/{module}Translations.js
export default {
    en: {
        moduleName: {
            entityName: {
                title: "Entities",
                addEntity: "Add Entity",
                editEntity: "Edit Entity",
                noEntities: "No Entities Found",
                noEntitiesDescription: "...",
                code: "Code",
                nameAr: "Arabic Name",
                nameEn: "English Name",
                isActive: "Active",
            },
        },
    },
    ar: {
        moduleName: {
            entityName: {
                title: "الكيانات",
                addEntity: "إضافة كيان",
                // ...
            },
        },
    },
};
```

### Registering translations

Import the new file in `src/i18n/index.js` and spread it into the messages:

```javascript
import myTranslations from "@/projects/myModule/translations/myTranslations";

messages: {
    en: { ...existingEn, ...myTranslations.en },
    ar: { ...existingAr, ...myTranslations.ar },
}
```

### Usage

```vue
<!-- In template -->
{{ $t("moduleName.entityName.addEntity") }}

<!-- In script setup -->
const { t } = useI18n();
const label = t("moduleName.entityName.title");
```

### RTL / LTR CSS rules

- **Use logical properties:** `ms-2` / `me-2` instead of `ml-2` / `mr-2`.
- **Use Tailwind RTL modifier** where needed: `rtl:flex-row-reverse`.
- **Never hardcode `left`/`right`** for layout — use `start`/`end`.

---

## 12. Styling Rules

- **Only Tailwind CSS utility classes** — no custom CSS unless unavoidable.
- **Dark mode** is supported via Tailwind's `dark:` variant (`dark:bg-surface-900`).
- **PrimeVue design tokens** are available as CSS variables: `--p-primary-color`, `--p-surface-800`, etc.
- **Volt components** handle their own base styles via `passThrough` — do not wrap them in extra divs unnecessarily.
- **Surface palette**: `surface-0` → `surface-900` for backgrounds/text.
- **Status colors**: green for active/success, red for inactive/error, orange for warnings.

```html
<!-- Active badge pattern -->
<span class="text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Active</span>
<span class="text-red-500 bg-red-500/10 px-2 py-1 rounded-md">Inactive</span>
```

---

## 13. Icons

Icons are from **Lucide Vue Next** and globally registered in `src/assets/icons/icons.js`.

```vue
<!-- Use directly in templates — no import needed -->
<User class="w-4 h-4" />
<CalendarCog class="w-5 h-5 text-primary" />
<OctagonX class="w-10 h-10 text-surface-500" />
```

To add a new icon:
1. Open `src/assets/icons/icons.js`
2. Import the icon from `lucide-vue-next`
3. Register with `app.component("IconName", IconName)`

---

## 14. Globally Registered Components (no import needed)

From `src/components/` (auto-registered by unplugin-vue-components):

| Component | Usage |
|---|---|
| `<SearchField v-model="search" />` | Search input |
| `<Paginator :currentPage :itemsPerPage :totalItems @page-change />` | Pagination |
| `<EditButton @click="edit(data)" />` | Edit action button |
| `<DeleteButtonPrompt :itemType :itemName :confirm />` | Delete with confirmation |
| `<DeleteButton @click />` | Simple delete button |
| `<ViewButton @click />` | View/detail button |
| `<LoadingSection />` | Centered loading spinner |
| `<LoadingSpinner />` | Inline spinner |
| `<ConfirmDialog />` | Generic confirm dialog |
| `<DeleteDialog />` | Generic delete dialog |
| `<Breadcrumb />` | Breadcrumb navigation |
| `<CustomStepper />` | Multi-step wizard |
| `<CustomTree />` | Tree display |

From `src/volt/` (auto-registered):

| Component | Notes |
|---|---|
| `<Button>` | Primary action |
| `<SecondaryButton>` | Secondary / cancel action |
| `<ContrastButton>` | High contrast |
| `<Dialog v-model:visible :title :subtitle :icon>` | Modal dialog |
| `<DataTable :value>` + `<Column>` | Data grid (Column is globally registered in main.js) |
| `<InputText>` | Text input |
| `<Select :options :option-label :option-value>` | Dropdown |
| `<MultiSelect>` | Multi-select dropdown |
| `<DatePicker>` | Date picker |
| `<Checkbox>` | Checkbox |
| `<Textarea>` | Text area |
| `<Tabs>` / `<TabList>` / `<Tab>` / `<TabPanels>` / `<TabPanel>` | Tab navigation |
| `<Skeleton>` | Loading placeholder |
| `<Tag>` | Inline tag (registered in main.js) |
| `<ProgressSpinner>` | Spinner (registered in main.js) |
| `<VueCal>` | Calendar component (registered in main.js) |

---

## 15. CRUD Page — Step-by-Step Checklist

### Step 1 — Create the Pinia Store

**File:** `src/projects/{module}/stores/use{Entity}Store.js`

```javascript
import { defineStore } from "pinia";

export const use{Entity}Store = defineStore("{entity}", {
    state: () => ({ items: [], loading: false }),
    actions: {
        async getItems() { /* apiGet + set items */ },
        async createItem(payload) { /* apiPost + refresh */ },
        async updateItem(payload) { /* apiPut + refresh */ },
        async deleteItem(id) { /* apiDelete + refresh */ },
    },
});
```

### Step 2 — Create the List Page

**File:** `src/projects/{module}/pages/{category}/{Entity}Page.vue`

Pattern:
1. `<SearchField>` + Add `<Button>` in header row.
2. `<LoadingSection v-if="store.loading" />` loading state.
3. Empty state with `<OctagonX>` icon + translated message.
4. `<DataTable :value="filteredItems">` with `<Column>` fields.
5. Actions column with `<EditButton>` + `<DeleteButtonPrompt>`.
6. `<Paginator>` at bottom.
7. Dialog component conditional render.
8. `onMounted(() => store.getItems())` + `onUnmounted(() => store.$dispose())`.

### Step 3 — Create the Add/Edit Dialog

**File:** `src/projects/{module}/pages/{category}/Add{Entity}Dialog.vue`

Pattern:
- `defineModel("visible")` + `defineModel("editData")`.
- `isEdit = computed(() => editData.value != null)`.
- `useForm({ validationSchema })` with Yup schema.
- `handleSubmit` that branches create vs update.
- `watch(visible)` to set/reset form values.

### Step 4 — Add Translations

**File:** `src/projects/{module}/translations/{module}Translations.js`

Add both `en` and `ar` sections.

Then register in `src/i18n/index.js`.

### Step 5 — Add Icon (if new)

**File:** `src/assets/icons/icons.js`

### Step 6 — Add Route

**File:** `src/projects/{module}/router.js`

```javascript
{ path: "entities", name: "Entities", component: () => import("./pages/.../EntityPage.vue") }
```

### Step 7 — Add Menu Item

**File:** `src/stores/baseStore.js` → `menuModel` array

```javascript
{ nameEn: "Entities", nameAr: "الكيانات", icon: "IconName", to: "/module/entities" }
```

---

## 16. Utility Functions (`src/utilities/functions.js`)

| Function | Signature | Purpose |
|---|---|---|
| `formatDate` | `(date, formatString?, locale?)` | Format date respecting locale & entity config |
| `formatTime` | `(date, formatString?)` | Format time (24h/12h) |
| `formatNumber` | `(number, formatString?)` | Format number with thousands separator |
| `extractBirthDateFromNationalId` | `(nationalId: string)` | Parse Egyptian national ID → Date |
| `extractGenderFromNationalId` | `(nationalId: string)` | Parse Egyptian national ID → 1 (M) / 2 (F) |
| `getFullName` | `(entity)` | Concatenate firstName + middleName + lastName |

Date format uses entity configuration from `baseStore.entityConfiguration.dateFormat` (default `dd/MM/yyyy`).

---

## 17. Navigation / Menu System

The sidebar menu is driven by `baseStore.menuModel` — a nested array:

```javascript
{
    nameEn: "Section Name",
    nameAr: "اسم القسم",
    icon: "IconName",         // Lucide icon name (PascalCase)
    items: [                  // children (optional)
        {
            nameEn: "Page Name",
            nameAr: "اسم الصفحة",
            icon: "IconName",
            to: "/module/page-path",    // Vue Router path
        },
        {
            nameEn: "Sub Group",
            icon: "IconName",
            items: [ /* more nesting */ ],
        },
    ],
}
```

- **Leaf nodes** have `to` (route path).
- **Group nodes** have `items` (no `to`).
- Breadcrumbs are auto-generated by `baseStore.getBreadcrumbs(currentPath, locale)`.

---

## 18. Authentication Flow

1. User submits credentials on `/login`.
2. Keycloak returns `access_token` + `refresh_token`.
3. Both stored in `localStorage` (`accessToken`, `refreshToken`).
4. Every API request: `apiClient.js` checks if token expires within 45 s — if so, silently refreshes.
5. On 401 response: one retry with fresh token; if failed → redirect to `/login`.
6. On login: `baseStore.getUserPages()` fetches allowed pages (`PAGES_TREE`) and builds page tree.
7. Router guard (`beforeEach`) checks access for every navigation.

---

## 19. Layouts

| Layout | Used for | File |
|---|---|---|
| `mainLayoutWithSidebar.vue` | All authenticated pages | `src/layouts/` |
| `loginLayout.vue` | Login page only | `src/layouts/` |

The authenticated layout renders `<navBar>` + `<sideBar>` + `<RouterView>`.

---

## 20. Common Page Patterns

### DataTable with server data

```vue
<DataTable class="w-full h-full" :value="store.items">
  <Column field="code" :header="$t('code')" />
  <Column field="nameAr" :header="$t('nameAr')" />
  <Column field="actions" :header="$t('actions')" headerClass="w-24" bodyClass="w-24 !p-0 !px-3">
    <template #body="{ data }">
      <EditButton @click="edit(data)" />
      <DeleteButtonPrompt
        :itemType="$t('entity')"
        :itemName="data.nameEn"
        :confirm="() => store.deleteItem(data.id)"
      />
    </template>
  </Column>
</DataTable>
```

### Client-side search + pagination

```javascript
const search = ref("")
const page = ref(1)
const pageSize = ref(10)

const filteredItems = computed(() =>
    store.items
        .filter(item => {
            const q = search.value.toLowerCase()
            return item.nameAr?.toLowerCase().includes(q)
                || item.nameEn?.toLowerCase().includes(q)
                || item.code?.toLowerCase().includes(q)
        })
        .slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
)

const onPageChange = (p) => { page.value = p }
```

### Boolean status badge

```vue
<span v-if="data.isActive" class="text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
  {{ $t("active") }}
</span>
<span v-else class="text-red-500 bg-red-500/10 px-2 py-1 rounded-md">
  {{ $t("inactive") }}
</span>
```

---

## 21. Project Modules Overview

| Module path | Route prefix | Purpose |
|---|---|---|
| `src/projects/sis/` | `/sis/` | Academic years, courses, sections, schedules, grades, results, dashboards, voting |
| `src/projects/structure/` | `/structure/` | Org hierarchy, employees, students, teaching staff, lookups |
| `src/projects/security/` | `/sec/` | Users, groups, permissions, roles, login, page access |
| `src/projects/hr_cycles/` | `/hr-cycles/` | Leave/absence management, discipline, HR workflows |

---

## 22. Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_ROOT_URL` | API base URL |
| `VITE_KEYCLOAK_URL` | Keycloak server URL |
| `VITE_KEYCLOAK_REALM` | Keycloak realm |
| `VITE_KEYCLOAK_CLIENT_ID` | Keycloak client ID |
| `VITE_BASE_PATH` | Base path (for Electron: `/`) |

---

## 23. Scripts

```bash
npm run dev          # Start dev server (accessible on network)
npm run build        # Production build
npm run preview      # Preview production build
npm run electron     # Run as Electron app (dev mode)
npm run electron-build  # Build Electron distributable
```

---

## 24. Key Rules Checklist

Before submitting any code, verify:

- [ ] `<script setup>` syntax used (no Options API).
- [ ] No manual imports for auto-imported items (`ref`, `apiGet`, store functions, etc.).
- [ ] Using `src/volt/` components, not raw PrimeVue.
- [ ] API calls go through `apiGet` / `apiPost` / `apiPut` / `apiDelete` (never raw `axios`).
- [ ] Form inputs use `*Valid` components from `src/components/validationFields/`.
- [ ] Translations added in both `en` and `ar` and registered in `src/i18n/index.js`.
- [ ] RTL-safe CSS: `ms-*`, `me-*`, `start-*`, `end-*`, `rtl:` modifiers — no hard `left`/`right`.
- [ ] Store disposed in `onUnmounted`: `store.$dispose()`.
- [ ] New icons registered in `src/assets/icons/icons.js`.
- [ ] Route added in module `router.js`.
- [ ] Menu item added in `baseStore.menuModel` (if user-accessible page).
