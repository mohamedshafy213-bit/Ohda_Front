# SIS pages, routes, control keys, and API registry — work plan

This document is the execution checklist for building a **single JSON artifact** that inventories the frontend: every navigable page, its route, Keycloak-style **`p_` page roles** and **`c_` control roles**. **Loading or reading data for a page is in scope of `p_` only** (who may open the route and see the screen). **`c_*` entries are for commands only** — mutations and other explicit user actions (add, edit, delete, publish, import, approve, generative side effects, etc.), each with the **HTTP + path** and inferred **API controller** segment for those commands. Routine GETs used to populate the page after navigation are **not** modeled as separate controls.

Wait for explicit user go-ahead (“start”) before producing the JSON file and wiring code.

---

## Reference implementation (Academic Years)

| Concern | Source | Pattern |
|--------|--------|---------|
| Page access | JWT `realm_access.roles` with `p_` prefix | `useAllowedControls.js` → `splitRealmPrefixedRoles` |
| Page key + route | `baseStore.js` → `menuModelAll[].items` (recursive) | e.g. `key: "p_academic_years"`, `to: "/sis/academic-years"` |
| Control access | Same JWT roles with `c_` prefix | `baseStore.getter hasAllowedControl(controlKey)` — **commands only** |
| Control naming | `academicYearsPage.vue`, `addAcademicYear.vue`, `academicCalendarDialog.vue` | `c_academic_years_add`, `c_academic_years_edit`, `c_academic_years_delete` (slug aligns with page key suffix `academic_years`) |
| Page data (reads) | Implied by **`p_*`** | Initial load, search refresh, detail fetches for display: `apiGet` / list endpoints — document optionally at **page** level for inventory, **not** as `c_*` rows |
| Commands | **`c_*`** + stores / handlers | `apiPost` / `apiPut` / `apiPatch` / `apiDelete` and any non-read action the UI treats as a control |

**Naming convention to apply everywhere**

- Page role: `p_<snake_case_page_slug>` — must match existing `menuModelAll` `key` values where they already exist (do not invent duplicates; extend only for routes missing from menu). **Assume anyone with this role may call the read APIs** needed to render and refresh list/detail data for that page (backend should enforce the same if stricter rules are required).
- Control roles: `c_<same_snake_slug>_<distinct_action>` — **commands only** (mutations and explicit actions). Short, unique suffixes per page, e.g. `_add`, `_edit`, `_delete`, `_export`, `_configure_calendar`. Do **not** mint `c_*` for “load grid” or “fetch by id for view”.
- Slug is derived from the **English menu `nameEn`** or stable route segment, normalized to snake_case, consistent with `p_academic_years` ↔ “Academic Year”.

---

## Deliverable: JSON shape (target)

One file (path TBD when implementing), roughly:

```json
{
  "pages": [
    {
      "pageId": "academic_years",
      "nameEn": "Academic Year",
      "routePath": "/sis/academic-years",
      "pageRole": "p_academic_years",
      "pageDataApis": [
        {
          "http": "GET",
          "apiPath": "/sis_api/AcademicYear",
          "controllerSegment": "AcademicYear",
          "note": "Covered by p_academic_years — not a c_* control"
        }
      ],
      "controls": [
        {
          "key": "c_academic_years_add",
          "description": "Open add dialog / submit create",
          "ui": ["Button toolbar", "Dialog primary"],
          "apis": [
            {
              "http": "POST",
              "apiPath": "/sis_api/AcademicYear",
              "controllerSegment": "AcademicYear"
            }
          ]
        }
      ]
    }
  ]
}
```

Extend as needed: `nameAr`, `routeAliases`, `notes` for dynamic routes (`:id`), controls with no HTTP command (pure UI/navigation), etc. **Do not** attach follow-up GET “refresh list” calls to `c_*` unless the product treats that refresh as a separately permissioned command; otherwise list them only under **`pageDataApis`** (or omit if redundant with the main GET).

**Controller field rule (frontend-only inference)**  
From paths like `/sis_api/AcademicCalendarDetail/CreateRecurringVacations`, set `controllerSegment` to the first path segment after the API base (e.g. `AcademicCalendarDetail`). If the backend uses different physical controller names, document that this field is **route convention**, not verified C# class names, unless we later cross-check the API repo.

---

## Phase 1 — Enumerate every page and route

1. **Primary source:** Walk `menuModelAll` in `src/stores/baseStore.js` recursively; collect every leaf with `to` + `key` + `nameEn` / `nameAr`.
2. **Secondary source:** `src/projects/sis/router.js` and `src/router/index.js` — register all `path` values, including nested and dynamic routes not represented as leaves in the menu (e.g. `/sis/assignments/:id/submissions`).
3. **Reconcile:**  
   - Menu leaf → canonical row with existing `p_*` key.  
   - Router-only → new row; generate `p_*` using same snake_case rules and flag `source: "router_only"` so Keycloak/menu can be updated later if needed.
4. **Aliases:** Honor `baseStore` breadcrumb / path logic (e.g. student assignments alias) in `routeAliases` on the JSON row.

---

## Phase 2 — Control keys per page (commands only)

1. **Glob search:** `hasAllowedControl('c_` and `hasAllowedControl("c_` across `src/`.
2. **Per page folder / route component:** Map each **`c_*`** to the nearest `pageId` (by import path under `pages/` or by route meta if present).
3. **Reads:** Collect GET (and read-only) endpoints used on mount / for display; attach to the page row as **`pageDataApis`** (or a short narrative under the page) and associate with **`pageRole` (`p_*`)**, not with `c_*`.
4. **Gaps:** Where a **command** button exists but **no** `c_*` guard yet (e.g. calendar icon on academic years table), document as `unrestricted` or propose a new key (e.g. `c_academic_years_configure_calendar`) — `status: "missing_in_ui"` vs `implemented`.
5. **Generative / non-CRUD commands:** Bulk import, publish, regenerate, approve, etc. each get `c_<page>_<verb>` in the registry even if not yet in Vue.

---

## Phase 3 — API + controller for command-backed controls

For each **`c_*`** (and each command `Button` / `EditButton` / `DeleteButtonPrompt` / toolbar action you are adding to the registry):

1. Trace the handler to the **Pinia store** or inline calls in the component.
2. Record **only non-read HTTP** used to perform the command: POST, PUT, PATCH, DELETE (and any custom “action” POST such as `.../CreateRecurringVacations`). Use method + path as in code (e.g. `` `/sis_api/AcademicYear/${id}` ``).
3. Set `controllerSegment` from path (see rule above). Include `sec_api` routes the same way.
4. If one command triggers **multiple write** calls, list them in `apis: [...]` ordered by call sequence. **Omit** trailing GET refreshes from the control’s `apis` unless the product explicitly permissions that refresh as part of the command; those belong under **`pageDataApis`** / `p_*`.

**Page inventory (optional but useful):** For `onMounted` / search / detail-for-view GETs, fill **`pageDataApis`** on the page object for documentation and backend alignment; do not duplicate them under `controls`.

**Stores to prioritize:** `src/projects/sis/stores/*.js`, shared `src/stores/*.js`, and ad-hoc calls in sibling components.

---

## Phase 4 — Validation

- No duplicate `pageRole` or duplicate `routePath` for the same logical page without an alias note.
- Every `c_*` in codebase appears in JSON; every JSON `c_*` marked `implemented` exists in code OR is explicitly `planned`.
- **No GET-only endpoints** listed under `controls[].apis` (reads belong on the page / `pageDataApis` with `p_*`).
- Spot-check Academic Years row against `academicYearStore.js` + three Vue files.

---

## Out of scope until user asks

- Changing Vue to add missing `hasAllowedControl` wrappers.
- Keycloak role creation.
- Editing `menuModelAll` for new `p_*` keys (registry can still list router-only pages).

---

## When the user says “start”

1. Execute Phases 1–4 with automated searches + manual pass for edge cases.  
2. Write the JSON file to a path the user approves (suggest: `src/projects/sis/config/page-control-registry.json` or `docs/sis-page-control-registry.json`).  
3. Optionally summarize diff vs menu-only list in a short reply.

---

## Quick reference — Academic Years APIs (from `academicYearStore.js`)

**Page data (`p_academic_years`) — document on page row, not as `c_*`:**

| Method | Path (representative) | Controller segment |
|--------|------------------------|-------------------|
| GET | `/sis_api/AcademicYear` | AcademicYear |
| GET | `/sis_api/AcademicYear/Current` | AcademicYear |
| GET | `/sis_api/AcademicCalendar/ByAcademicYear/{id}` | AcademicCalendar |

**Commands (`c_*`) — registry controls:**

| Control intent | Method | Path (representative) | Controller segment |
|----------------|--------|------------------------|-------------------|
| Add year | POST | `/sis_api/AcademicYear` | AcademicYear |
| Edit year | PUT | `/sis_api/AcademicYear` | AcademicYear |
| Delete year | DELETE | `/sis_api/AcademicYear/{id}` | AcademicYear |
| Create calendar | POST | `/sis_api/AcademicCalendar` | AcademicCalendar |
| Recurring vacations | POST | `/sis_api/AcademicCalendarDetail/CreateRecurringVacations` | AcademicCalendarDetail |
| Add calendar detail (holiday) | POST | `/sis_api/AcademicCalendarDetail` | AcademicCalendarDetail |
| Delete calendar detail | DELETE | `/sis_api/AcademicCalendarDetail/{id}` | AcademicCalendarDetail |

(Store also contains a likely typo: `GET /AcadmicYear/${id}` — note in JSON `known_issues` when inventorying.)
