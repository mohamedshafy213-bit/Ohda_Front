# Structure Module Guide

This document provides an overview of the `src/projects/structure` module, which manages the organizational hierarchy, personnel (Managers, Students, Teaching Staff), and supporting lookup data (Main Data).

## Directory Structure

```text
src/projects/structure/
├── pages/              # Module-specific pages
│   ├── hierachy/       # Hierarchy tree and chart views
│   ├── housing/        # Housing and buildings management
│   ├── jobs/           # Job definitions
│   ├── mainData/       # Lookup tables (Blood types, Religions, etc.)
│   ├── militaryHousing/ # Specialized housing for military
│   └── person/         # Person entities (Managers, Students, Staff)
├── stores/             # Pinia stores for state management
├── translations/       # Module-specific i18n keys
├── enums.js            # Module constants (PersonType, Gender)
└── router.js           # Route definitions
```

## Core Entities

### 1. Person (`person/`)

The module handles three main types of persons, all sharing a base `personStore.js`:

- **Managers**: Handled via `ManagersPage.vue` and `ManagerDetails.vue`.
- **Students**: Handled via `StudentPage.vue` and `StudentDetails.vue`.
- **Teaching Staff**: Handled via `TeachingStaffPage.vue` and `TeachingStaffDetails.vue`.

**State Management:**

- `personStore.js`: General person CRUD.
- `studentEnrollmentStore.js`: Specialized store for student academics.

### 2. Hierarchy (`hierachy/`)

Manages the organization's structural units.

- **Pages**: `HierarchyPage.vue` supports both Tree and Chart views.
- **Store**: `hierarchyStore.js`.

### 3. Housing (`housing/` & `militaryHousing/`)

Manages physical locations like buildings, floors, and rooms.

- **Store**: `housingStore.js`, `militaryHousing.js`.

### 4. Main Data (`mainData/`)

Small CRUD entities used as lookups across the system.

- **Entities**: BloodType, Religion, Batch, MilitaryRank, Weapon, Nationality, Governate, District, College, Qualification.
- **Pattern**: Most follow the standard CRUD pattern with a dedicated store (e.g., `useBloodTypeStore.js`) and page (e.g., `BloodTypePage.vue`).

## Key Patterns

### Routing

Routes are defined in `router.js` and typically follow this structure:

- `list`: Main table view.
- `add`: Form with `mode: 'add'`.
- `edit/:id`: Form with `mode: 'edit'`.
- `view/:id`: Detail view with `mode: 'view'`.

### Enums

Common enums are defined in `enums.js`:

- `PersonType`: { Manager: 1, Student: 2, TeachingStaff: 3 }
- `Gender`: { Male: 1, Female: 2 }

### Internationalization

Translations are centralizing in `translations/structureTranslations.js`. It includes both `en` and `ar` keys.

## Quick Reference for Edits

- **Adding a new lookup type**: Follow the pattern in `src/projects/structure/pages/mainData/batch`. Create a store, add routes to `router.js`, and add translations.
- **Modifying Person forms**: Check `src/projects/structure/pages/person/` for the specific details component.
- **Hierarchy changes**: Look into `src/projects/structure/pages/hierachy/HierarchyPage.vue` and `hierarchyStore.js`.
