# Person Management Guide

This directory manages the core people entities in the SIS: **Managers**, **Students**, and **Teaching Staff**. It uses a highly modular architecture for forms and listings.

## Directory Structure

```text
person/
├── components/          # Fragmented UI pieces
│   ├── shared/          # Reusable person UI (InfoCards, Forms, ProfileHeaders)
│   ├── managers/        # Manager-specific sub-components
│   └── student/         # Student-specific sub-components (Enrollment, Accommodation)
├── AddEdit*/            # Legacy or wrapper directories for specific types
├── *Page.vue            # Listing/Main entry points (ManagersPage, StudentPage)
└── *Details.vue         # Complex form/view logic (StudentDetails, ManagerDetails)
```

## Core Architecture Patterns

### 1. The Listing Pattern (`*Page.vue`)

Listing pages (e.g., `StudentPage.vue`) follow a standard layout:

- **Top Section**: `PersonTopSection` for search, view toggles (Card vs. List), and "Add" action.
- **Data Display**: Toggleable between `PersonCard` grid and PrimeVue `DataTable`.
- **Pagination**: Uses `Paginator` component synced with `personStore.js`.
- **Add Flow**: Triggers `CheckNationalIdDialog` before proceeding to the Add form.

### 2. The Modular Form Pattern (`*Details.vue`)

Complex forms like `StudentDetails.vue` avoid monoliths by using:

- **Mode Handling**: Driven by `route.meta.mode` (`add`, `edit`, `view`).
- **Sectional Editing**: Each part of the profile (Personal, Contact, Military) is an encapsulated form in `components/shared/forms/`.
- **In-place Status**: In `view` mode, users click "Edit" on a specific `InfoCard` to swap it for a `FormCard` containing the granular form.
- **Add Mode**: All forms are shown in "Edit" state simultaneously.

### 3. Key Shared Components (`components/shared/`)

Located in `src/projects/structure/pages/person/components/shared/`:

- `PersonProfileHeader.vue`: Top banner with avatar and basic info.
- `InfoCard.vue` & `InfoItem.vue`: Standardized display for read-only data.
- `FormCard.vue`: Wrapper for edit-mode sections.
- **Granular Forms**: `PersonalDetailsForm`, `ContactDetailsForm`, `ExtraDetailsForm`, `MilitaryDetailsForm`.

### 4. Duplicate Prevention

The system enforces a "Check National ID first" rule.

- `CheckNationalIdDialog.vue`: Hits the `/CheckNationalId/{id}` API.
  - If found, it offers to "Create as [Type]" (linking existing person record to a new role).
  - If not found, it proceeds to the full Add Person form.

## State Management

Centralized in `src/projects/structure/stores/personStore.js`:

- Organizes state by person type: `managers`, `students`, `teachingStaff`.
- Handles shared CRUD operations: `getPersonById`, `addPerson`, `updatePerson`, `deletePerson`.
- Manages static lookups like `genders`, `maritalStatuses`, and `relationships`.

## Future Edits Checklist

- **Updating a form field**: Modify the specific form component in `components/shared/forms/`.
- **Adding a new person status**: Update the computed `status` and `statusLabel` in the relevant `*Details.vue`.
- **Changing listing columns**: Edit the `DataTable` section in the relevant `*Page.vue`.
