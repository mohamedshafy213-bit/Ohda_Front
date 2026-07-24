import { useBaseStore } from "@/stores/baseStore.js";

/**
 * Keycloak JWT helpers: realm roles use prefixes p_ (pages) and c_ (controls).
 */

export function decodeJwtPayload(token) {
    if (!token || typeof token !== "string") return null;
    const normalized = token.trim().replace(/^Bearer\s+/i, "");
    const payloadPart = normalized.split(".")[1];
    if (!payloadPart) return null;
    try {
        const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "=",
        );
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}

/**
 * @param {unknown} roles - typically `realm_access.roles` from JWT payload
 * @returns {{ allowedMenuPageNames: string[], allowedControls: string[] }}
 */
export function splitRealmPrefixedRoles(roles) {
    const allowedMenuPageNames = [];
    const allowedControls = [];
    if (!Array.isArray(roles)) {
        return { allowedMenuPageNames, allowedControls };
    }
    for (const role of roles) {
        if (typeof role !== "string") continue;
        if (role.startsWith("p_")) allowedMenuPageNames.push(role);
        else if (role.startsWith("c_")) allowedControls.push(role);
    }
    return { allowedMenuPageNames, allowedControls };
}

/**
 * @param {Record<string, unknown>} payload - decoded JWT payload
 */
export function extractRealmRolesFromPayload(payload) {
    const roles = payload?.realm_access?.roles;
    return splitRealmPrefixedRoles(roles);
}

/**
 * Realm control roles (`c_*`) from JWT.
 * @returns {{ hasAllowedControl: (controlKey: string) => boolean }}
 */
export function useAllowedControls() {
    const baseStore = useBaseStore();
    return {
        hasAllowedControl: (controlKey) =>
            baseStore.hasAllowedControl(controlKey),
    };
}
