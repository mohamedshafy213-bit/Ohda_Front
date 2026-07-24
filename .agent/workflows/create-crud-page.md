---
description: How to create a CRUD page for a new entity (like BloodType, Religion, MaritalStatus, etc.)
---

# Creating a CRUD Page Workflow

This workflow explains how to create a complete CRUD (Create, Read, Update, Delete) page for a new entity in the SIS application. Use the BloodType implementation as a reference.

## Prerequisites

1. Check the **Swagger API** (`swaggerApi.json`) for:
   - Available endpoints (GET, POST, PUT, DELETE)
   - Data model fields (CreateDto and UpdateDto schemas)
   - API path pattern (e.g., `/BloodType`, `/BloodType/{id}`)

2. Check **icons.js** to see available icons or add a new one if needed

3. Identify where the page belongs in the menu structure (e.g., Structure > Main Data)

---

## Step 1: Create the Pinia Store

**Location:** `src/projects/{module}/stores/use{Entity}Store.js`

Example: `src/projects/structure/stores/useBloodTypeStore.js`

```javascript
import { defineStore } from "pinia";

export const use{Entity}Store = defineStore("{entity}", {
    state: () => ({
        {entities}: [],          // Plural: bloodTypes, religions, etc.
        loading: false,
    }),
    actions: {
        async get{Entities}() {
            this.loading = true;
            try {
                const response = await apiGet("/sis_api/{Entity}");
                this.{entities} = response.data.objects || response.data || [];
            } catch (error) {
                console.error("Error fetching {entities}:", error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async get{Entity}(id) {
            try {
                const response = await apiGet(`/sis_api/{Entity}/${id}`);
                return response.data;
            } catch (error) {
                console.error("Error fetching {entity}:", error);
                throw error;
            }
        },
        async create{Entity}({entity}) {
            try {
                const response = await apiPost("/sis_api/{Entity}", {entity});
                await this.get{Entities}();
                return response.data;
            } catch (error) {
                console.error("Error creating {entity}:", error);
                throw error;
            }
        },
        async update{Entity}({entity}) {
            try {
                const response = await apiPut("/sis_api/{Entity}", {entity});
                await this.get{Entities}();
                return response.data;
            } catch (error) {
                console.error("Error updating {entity}:", error);
                throw error;
            }
        },
        async delete{Entity}(id, softDelete = true) {
            try {
                const response = await apiDelete(`/sis_api/{Entity}/${id}`);
                await this.get{Entities}();
                return response.data;
            } catch (error) {
                console.error("Error deleting {entity}:", error);
                throw error;
            }
        },
    },
});
```

**Key points:**

- `apiGet`, `apiPost`, `apiPut`, `apiDelete` are auto-imported from utilities
- Always refresh the list after create/update/delete operations
- Handle loading state for UI feedback

---

## Step 2: Create the List Page Component

**Location:** `src/projects/{module}/pages/{category}/{entity}/{Entity}Page.vue`

Example: `src/projects/structure/pages/mainData/bloodType/BloodTypePage.vue`

```vue
<template>
  <div class="flex flex-col gap-4 py-4 px-1 w-full h-full">
    <!-- Header with Search and Add Button -->
    <div class="flex gap-2 items-center">
      <SearchField v-model="search" />
      <div class="flex gap-2 grow justify-end">
        <Button class="p-2! text-sm gap-2" @click="addDialogVisible = true">
          <{Icon} class="w-4 h-4" />
          <span class="font-semibold">
            {{ $t("{module}.{entity}.add{Entity}") }}
          </span>
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSection v-if="{entity}Store.loading" />

    <!-- Empty State -->
    <div
      v-else-if="{entities}Filtered.length === 0"
      class="h-full grow flex items-center justify-center bg-surface-50 dark:bg-surface-900 rounded-2xl"
    >
      <div class="flex flex-col gap-4 items-center">
        <OctagonX class="w-10 h-10 text-surface-500" />
        <h1 class="text-2xl font-bold dark:text-white">
          {{ $t("{module}.{entity}.no{Entities}") }}
        </h1>
        <p class="text-sm text-surface-500 dark:text-surface-400">
          {{ $t("{module}.{entity}.no{Entities}Description") }}
        </p>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable v-else class="w-full h-full" :value="{entities}Filtered">
      <!-- Add columns based on entity fields -->
      <Column field="code" :header="$t('{module}.{entity}.code')"></Column>
      <Column field="nameAr" :header="$t('{module}.{entity}.nameAr')"></Column>
      <Column field="nameEn" :header="$t('{module}.{entity}.nameEn')"></Column>

      <!-- Active Status Column -->
      <Column field="isActive" :header="$t('{module}.{entity}.isActive')">
        <template #body="{ data }">
          <span
            v-if="data.isActive"
            class="text-green-500 bg-green-500/10 px-2 py-1 rounded-md"
          >
            {{ $t("active") }}
          </span>
          <span v-else class="text-red-500 bg-red-500/10 px-2 py-1 rounded-md">
            {{ $t("inactive") }}
          </span>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column
        field="actions"
        :header="$t('actions')"
        headerClass="w-24"
        bodyClass="w-24 !p-0 !px-3"
      >
        <template #body="{ data }">
          <EditButton @click="edit{Entity}(data)" />
          <DeleteButtonPrompt
            :itemType="$t('{module}.{entity}.{entity}')"
            :itemName="data.nameEn || data.code"
            :confirm="() => {entity}Store.delete{Entity}(data.id)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Pagination -->
    <Paginator
      class="justify-self-end"
      :currentPage="page"
      :itemsPerPage="pageSize"
      :totalItems="{entity}Store.{entities}.length"
      @page-change="onPageChange"
    />

    <!-- Add/Edit Dialog -->
    <Add{Entity}Dialog
      v-model:visible="addDialogVisible"
      v-model:editData="edited{Entity}"
    />
  </div>
</template>

<script setup>
import Add{Entity}Dialog from "./Add{Entity}Dialog.vue";
import { use{Entity}Store } from "@/projects/{module}/stores/use{Entity}Store";

const {entity}Store = use{Entity}Store();
const addDialogVisible = ref(false);
const edited{Entity} = ref(null);
const page = ref(1);
const pageSize = ref(10);
const search = ref("");

const {entities}Filtered = computed(() => {
    return {entity}Store.{entities}
        .filter(({entity}) => {
            const searchLower = search.value.toLowerCase();
            return (
                {entity}.nameAr?.toLowerCase().includes(searchLower) ||
                {entity}.nameEn?.toLowerCase().includes(searchLower) ||
                {entity}.code?.toLowerCase().includes(searchLower)
            );
        })
        .slice((page.value - 1) * pageSize.value, page.value * pageSize.value);
});

const onPageChange = (event) => {
    page.value = event;
};

const edit{Entity} = (data) => {
    edited{Entity}.value = data;
    addDialogVisible.value = true;
};

onMounted(() => {
    {entity}Store.get{Entities}();
});

onUnmounted(() => {
    {entity}Store.$dispose();
});
</script>
```

**Key points:**

- Use `SearchField` for searching
- Use `LoadingSection` while loading
- Use `DataTable` from Volt components
- Use `EditButton` and `DeleteButtonPrompt` for actions
- Use `Paginator` for pagination
- Import the store and dialog component

---

## Step 3: Create the Add/Edit Dialog Component

**Location:** `src/projects/{module}/pages/{category}/{entity}/Add{Entity}Dialog.vue`

Example: `src/projects/structure/pages/mainData/bloodType/AddBloodTypeDialog.vue`

```vue
<template>
  <Dialog
    v-model:visible="visible"
    :title="
      isEdit
        ? t('{module}.{entity}.edit{Entity}')
        : t('{module}.{entity}.add{Entity}')
    "
    :subtitle="
      isEdit
        ? t('{module}.{entity}.edit{Entity}Subtitle')
        : t('{module}.{entity}.add{Entity}Subtitle')
    "
    icon="{IconName}"
  >
    <div class="flex flex-col gap-4">
      <!-- Form Fields -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1 w-full">
          <label for="code" class="required">{{
            t("{module}.{entity}.code")
          }}</label>
          <InputTextValid name="code" />
        </div>
        <div class="flex flex-col gap-1 w-full">
          <label for="sortOrder">{{ t("{module}.{entity}.sortOrder") }}</label>
          <InputTextValid name="sortOrder" type="number" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1 w-full">
          <label for="nameAr" class="required">{{
            t("{module}.{entity}.nameAr")
          }}</label>
          <InputTextValid name="nameAr" />
        </div>
        <div class="flex flex-col gap-1 w-full">
          <label for="nameEn" class="required">{{
            t("{module}.{entity}.nameEn")
          }}</label>
          <InputTextValid name="nameEn" />
        </div>
      </div>

      <!-- isActive checkbox (only in edit mode) -->
      <div v-if="isEdit" class="flex flex-row gap-2 w-full items-center">
        <CheckboxValid name="isActive" />
        <label for="isActive">{{ t("{module}.{entity}.isActive") }}</label>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-row items-center justify-center gap-3 w-full">
        <Button @click="onSubmit()" class="w-full max-w-40">
          {{ isEdit ? t("edit") : t("add") }}
        </Button>
        <SecondaryButton @click="visible = false" class="w-full max-w-40">
          {{ t("cancel") }}
        </SecondaryButton>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { use{Entity}Store } from "@/projects/{module}/stores/use{Entity}Store";
import * as yup from "yup";

const {entity}Store = use{Entity}Store();
const { t } = useI18n();
const visible = defineModel("visible");
const editData = defineModel("editData");
const isEdit = computed(() => editData.value != null);

// Define validation schema based on API fields
const schema = yup.object().shape({
    code: yup.string().required().max(30),
    nameAr: yup.string().required().max(100),
    nameEn: yup.string().required().max(100),
    sortOrder: yup.number().nullable().min(0),
    isActive: yup.boolean().nullable(),
});

const { handleSubmit, setValues, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
        code: "",
        nameAr: "",
        nameEn: "",
        sortOrder: 0,
        isActive: true,
    },
});

const onSubmit = handleSubmit(
    (values) => {
        const payload = {
            code: values.code,
            nameAr: values.nameAr,
            nameEn: values.nameEn,
            sortOrder: values.sortOrder ? Number(values.sortOrder) : 0,
            isActive: values.isActive ?? true,
        };

        if (editData.value != null) {
            payload.id = editData.value.id;
            {entity}Store.update{Entity}(payload);
        } else {
            {entity}Store.create{Entity}(payload);
        }
        visible.value = false;
    },
    (errors) => {
        console.log(errors);
    }
);

// Watch for dialog visibility changes
watch(visible, (newValue) => {
    if (newValue && isEdit.value) {
        // Populate form with edit data
        setValues({
            code: editData.value.code,
            nameAr: editData.value.nameAr,
            nameEn: editData.value.nameEn,
            sortOrder: editData.value.sortOrder,
            isActive: editData.value.isActive,
        });
    } else if (newValue) {
        // Reset form for new entry
        resetForm();
    } else {
        // Clear edit data when closing
        editData.value = null;
    }
});
</script>
```

**Key points:**

- Use `defineModel` for two-way binding of `visible` and `editData`
- Use `yup` for validation schema
- Use `useForm` from VeeValidate (auto-imported)
- Use `*Valid` components for form fields with validation
- Watch `visible` to set/reset form values
- Use `required` class on labels for required fields

---

## Step 4: Add Translations

**Location:** `src/projects/{module}/translations/{module}Translations.js`

Add translations for both English and Arabic:

```javascript
// In the 'en' section under 'structure' (or appropriate module):
{entity}: {
    title: "{Entities}",
    searchPlaceholder: "Search by Name or Code",
    no{Entities}: "No {Entities} Found",
    no{Entities}Description: "There are no {entities} matching your criteria.",
    add{Entity}: "Add {Entity}",
    edit{Entity}: "Edit {Entity}",
    add{Entity}Subtitle: "Enter the details for the new {entity}",
    edit{Entity}Subtitle: "Update the {entity} details",
    {entity}: "{Entity}",
    code: "Code",
    nameAr: "Arabic Name",
    nameEn: "English Name",
    sortOrder: "Sort Order",
    isActive: "Active",
},

// In the 'ar' section under 'structure' (or appropriate module):
{entity}: {
    title: "{Arabic Title}",
    searchPlaceholder: "بحث بالاسم أو الكود",
    no{Entities}: "لا يوجد {Arabic plural}",
    no{Entities}Description: "لا يوجد {Arabic plural} مطابقة لبحثك.",
    add{Entity}: "إضافة {Arabic singular}",
    edit{Entity}: "تعديل {Arabic singular}",
    add{Entity}Subtitle: "أدخل بيانات {Arabic singular} الجديدة",
    edit{Entity}Subtitle: "تحديث بيانات {Arabic singular}",
    {entity}: "{Arabic singular}",
    code: "الكود",
    nameAr: "الاسم بالعربية",
    nameEn: "الاسم بالإنجليزية",
    sortOrder: "ترتيب العرض",
    isActive: "نشط",
},
```

---

## Step 5: Add Icon (if needed)

**Location:** `src/assets/icons/icons.js`

If you need a new icon:

1. Import it from lucide-vue-next:

```javascript
import { NewIcon } from "lucide-vue-next";
```

2. Register it in the `importIcons` function:

```javascript
app.component("NewIcon", NewIcon);
```

---

## Step 6: Add Route

**Location:** `src/projects/{module}/router.js`

Add the route for the new page:

```javascript
{
    path: "{entity-plural-kebab}",   // e.g., "blood-types"
    name: "{entity-plural-kebab}-list",
    component: () => import("./pages/{category}/{entity}/{Entity}Page.vue"),
},
```

---

## Step 7: Add Menu Item

**Location:** `src/stores/baseStore.js`

Add the menu item under the appropriate section in `menuModel`:

```javascript
{
    nameEn: "{Entity Plural}",
    nameAr: "{Arabic Plural}",
    icon: "{IconName}",
    to: "/{module}/{entity-plural-kebab}",
},
```

Or if it's under a submenu:

```javascript
{
    nameEn: "Main Data",
    nameAr: "البيانات الأساسية",
    icon: "FileText",
    items: [
        {
            nameEn: "{Entity Plural}",
            nameAr: "{Arabic Plural}",
            icon: "{IconName}",
            to: "/{module}/{entity-plural-kebab}",
        },
        // ... other items
    ],
},
```

---

## Checklist Summary

When creating a new CRUD page, complete these steps:

- [ ] Check Swagger API for endpoints and data model
- [ ] Create Pinia store (`use{Entity}Store.js`)
- [ ] Create list page (`{Entity}Page.vue`)
- [ ] Create add/edit dialog (`Add{Entity}Dialog.vue`)
- [ ] Add translations (EN and AR)
- [ ] Add icon if needed (`icons.js`)
- [ ] Add route (`router.js`)
- [ ] Add menu item (`baseStore.js`)
- [ ] Test the page in browser

---

## Common Patterns

### Typical Entity Fields

Most lookup/reference entities have these fields:

- `code` - Unique code
- `nameAr` - Arabic name
- `nameEn` - English name
- `sortOrder` - Display order
- `isActive` - Active/inactive status

### API Path Pattern

- `GET /sis_api/{Entity}` - Get all
- `POST /sis_api/{Entity}` - Create
- `PUT /sis_api/{Entity}` - Update
- `DELETE /sis_api/{Entity}/{id}` - Delete

### File Structure

```
src/projects/{module}/
├── pages/
│   └── {category}/
│       └── {entity}/
│           ├── {Entity}Page.vue
│           └── Add{Entity}Dialog.vue
├── stores/
│   └── use{Entity}Store.js
├── translations/
│   └── {module}Translations.js
└── router.js
```
