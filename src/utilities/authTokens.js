import axios from "axios";
import { decodeJwtPayload } from "../composables/useAllowedControls";

const KEYCLOAK_CONFIG = {
    baseUrl:
        import.meta.env.VITE_KEYCLOAK_URL ||
        "https://www.isd-sis.mil/authentication",
    realm: import.meta.env.VITE_KEYCLOAK_REALM || "master",
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "sis",
};

const IDENTITY_ACCESS_KEY = "identityAccessToken";
const IDENTITY_REFRESH_KEY = "identityRefreshToken";
const ACTIVE_PU_KEY = "activePersonUniversityId";
export function isScopedAuthToken(token) {
    const payload = decodeJwtPayload(token);
    return payload?.authz_context === "active";
}

export function storeIdentityTokens(accessToken, refreshToken) {
    if (accessToken) {
        localStorage.setItem(IDENTITY_ACCESS_KEY, accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(IDENTITY_REFRESH_KEY, refreshToken);
    }
}

export function getActivePersonUniversityId() {
    const raw = localStorage.getItem(ACTIVE_PU_KEY);
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
}

export function setActivePersonUniversityId(personUniversityId) {
    if (personUniversityId) {
        localStorage.setItem(ACTIVE_PU_KEY, String(personUniversityId));
    }
}

export function clearAuthTokenStorage() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem(IDENTITY_ACCESS_KEY);
    localStorage.removeItem(IDENTITY_REFRESH_KEY);
    localStorage.removeItem(ACTIVE_PU_KEY);
    localStorage.removeItem("UniversityId");
    localStorage.removeItem("personType");
    localStorage.removeItem("personTypeName");
    localStorage.removeItem("universityName");
}

function isExpiringSoon(token, skewSeconds = 120) {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;
    const now = Date.now() / 1000;
    return payload.exp - now < skewSeconds;
}

let identityRefreshPromise = null;

/** Refresh the identity (login) access token using the identity refresh token. */
export async function refreshIdentityAccessToken() {
    if (identityRefreshPromise) return identityRefreshPromise;

    const refreshToken = localStorage.getItem(IDENTITY_REFRESH_KEY);
    if (!refreshToken) {
        throw new Error("Identity refresh token is missing. Please login again.");
    }

    const url = `${KEYCLOAK_CONFIG.baseUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", KEYCLOAK_CONFIG.clientId);
    params.append("refresh_token", refreshToken);

    identityRefreshPromise = axios
        .post(url, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .then((res) => {
            const accessToken = res.data.access_token;
            const newRefresh = res.data.refresh_token || refreshToken;
            storeIdentityTokens(accessToken, newRefresh);
            return accessToken;
        })
        .finally(() => {
            identityRefreshPromise = null;
        });

    return identityRefreshPromise;
}

/** Identity bearer for token exchange (login token, not scoped). */
export async function ensureIdentityAccessToken() {
    let token = localStorage.getItem(IDENTITY_ACCESS_KEY);
    if (!token) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken && !isScopedAuthToken(accessToken)) {
            token = accessToken;
        }
    }

    if (!token || isExpiringSoon(token)) {
        token = await refreshIdentityAccessToken();
    }
    return token;
}

/**
 * Re-activate the stored context and return a new scoped access token.
 * @param {(personUniversityId: number) => Promise<string>} activateFn
 */
export async function reactivateScopedContext(activateFn) {
    const personUniversityId = getActivePersonUniversityId();
    if (!personUniversityId) {
        throw new Error("No active person university context to re-activate.");
    }
    return activateFn(personUniversityId);
}
