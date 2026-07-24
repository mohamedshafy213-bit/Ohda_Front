/**
 * Role utilities matching RoleSelectPopup's roleConfig.
 * Canonical roles: student, teacher, staff, medic
 */
export const MEDIC_CLINIC_EXAM_PATH = "/hr-cycles/clinic-exam";
export const PERSON_TYPE_MEDIC = 4;

export const roleAliases = {
    instructor: "teacher",
    faculty: "teacher",
    professor: "teacher",
    employee: "staff",
    admin: "staff",
    administrator: "staff",
    medic: "medic",
    doctor: "medic",
    4: "medic",
    "4": "medic",
};

/**
 * @param {string | number | null | undefined} [personTypeName]
 */
export function getNormalizedRole(personTypeName) {
    const key = String(personTypeName ?? "").trim().toLowerCase();
    return roleAliases[key] || key || "staff";
}

/** Default post-login path when person type is unknown (matches RoleSelectPopup). */
export const ROLE_DASHBOARD_FALLBACK = "/landing";

/**
 * @param {string | number | null | undefined} personTypeName
 * @param {string | number | null | undefined} [personTypeId]
 */
export function isMedicPerson(personTypeName, personTypeId) {
    if (Number(personTypeId) === PERSON_TYPE_MEDIC) {
        return true;
    }
    return getNormalizedRole(personTypeName) === "medic";
}

function readStoredPersonTypeId() {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem("personType");
}

function readStoredPersonTypeName() {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem("personTypeName");
}

/**
 * Home route after login / role selection for the current person type.
 * @param {string | null | undefined} personTypeName
 * @param {string} [fallbackPath=ROLE_DASHBOARD_FALLBACK]
 * @param {string | number | null | undefined} [personTypeId]
 */
export function getRoleDashboardPath(
    personTypeName,
    fallbackPath = ROLE_DASHBOARD_FALLBACK,
    personTypeId = readStoredPersonTypeId(),
) {
    if (isMedicPerson(personTypeName, personTypeId)) {
        return MEDIC_CLINIC_EXAM_PATH;
    }

    const roleName = getNormalizedRole(personTypeName);

    if (roleName === "student") {
        return "/sis/student-landing-page";
    }
    if (roleName === "teacher") {
        return "/sis/professor-landing-page";
    }
    if (roleName === "staff") {
        return "/sis/admin-landing-page";
    }

    return fallbackPath;
}

/** True when the active session belongs to a medic. */
export function isActiveMedicSession() {
    return isMedicPerson(readStoredPersonTypeName(), readStoredPersonTypeId());
}
