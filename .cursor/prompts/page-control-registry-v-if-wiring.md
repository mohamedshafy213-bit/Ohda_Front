# Prompt: Wire `useAllowedControls` from `page-control-registry.json`

Copy everything below the line into a new chat (or attach this file) when you want a page gated the same way as **Academic Years** (`academicYearsPage.vue` / `addAcademicYear.vue`).

---

## Task prompt (paste for the agent)

Wire **realm control** permissions for page **`<PAGE_ID>`** using `src/projects/sis/config/page-control-registry.json` as the source of truth.

1. Find the page entry by `pageId` (and `routePath` if needed).
2. For each control under `controls[]`, note its `key` (e.g. `c_academic_years_add`).
3. In every Vue file that **shows UI** which triggers the matching APIs (toolbar add, row edit/delete, dialog submit, extra toolbars), add:
   - `const { hasAllowedControl } = useAllowedControls();` in `<script setup>` (auto-imported like other SIS pages; no manual import if the project already does this).
   - `v-if="hasAllowedControl('<control_key>')"` on the **smallest element that performs the action** (usually `Button`, `EditButton`, `DeleteButtonPrompt`, or a grouped block).
4. **Add dialog pattern** (match `addAcademicYear.vue`): gate the primary submit `Button` with  
   `v-if="isEdit ? hasAllowedControl('c_*_edit') : hasAllowedControl('c_*_add')"` when create and update share one form.
5. Do **not** hide read-only list/grid data behind `c_*` unless the registry explicitly treats list load as a control (usually page access `p_*` covers GET list).
6. After wiring, update **`page-control-registry.json`** for that page:
   - Set each wired control `status` to `"implemented"`.
   - Fill `ui` with bullet-style entries: `"<file.vue> — <what is gated>"`.
   - Adjust `description` if needed so it matches actual UI behavior.

Reference implementation: `src/projects/sis/pages/academicYears/` and `src/projects/sis/pages/rooms/` (after wiring).

Composable: `src/composables/useAllowedControls.js` (`hasAllowedControl` delegates to `baseStore` / JWT `c_*` roles).

---

## Explainer (what this does)

- **Page access** uses Keycloak realm roles prefixed with `p_` (e.g. `p_rooms`). Users need the page role to see the route/menu.
- **Fine-grained actions** use roles prefixed with `c_` (e.g. `c_rooms_add`). The app checks these at runtime with `hasAllowedControl('c_rooms_add')`.
- **`page-control-registry.json`** documents which UI touches which control keys and which HTTP APIs; keeping `status` and `ui` accurate avoids drift between security and product.
- **Pattern**: one `v-if` per actionable control key on the control that fires the mutation—not on the whole page unless the whole page is that one action.

---

## Checklist per page

- [ ] Toolbar / list: add, edit, delete (or domain-specific actions) each have `v-if` with the registry `key`.
- [ ] Shared add/edit dialog: submit button uses add vs edit split `v-if` when applicable.
- [ ] Nested components that call the same APIs: same keys as in registry (reuse `useAllowedControls()` in child if needed).
- [ ] Registry: `status` → `implemented`, `ui[]` populated for wired controls.
