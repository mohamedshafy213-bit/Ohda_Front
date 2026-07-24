import { defineStore } from "pinia";
import { apiGet } from "@/utilities/fetchApi.js";
import { isScopedAuthToken } from "@/utilities/authTokens.js";

/** Dedupes concurrent/overlapping navigations onto a single in-flight request. */
let contextLoadPromise = null;

export const useCentricUniversityStore = defineStore("centricUniversity", {
    state: () => ({
        universityId: null,
        nameAr: null,
        nameEn: null,
        isCentric: false,
        /** Non-centric units below the current university, all depths. Empty when not centric. */
        descendants: [],
        descendantIds: [],
        loaded: false,
        loading: false,
        /** Token the current state was resolved for — a new token invalidates it. */
        resolvedForToken: null,
    }),

    getters: {
        isCentricUniversity: (state) => state.isCentric,
        hasDescendant: (state) => (id) => state.descendantIds.includes(Number(id)),
        /** Ids the user may act on: their own university plus every non-centric unit under it. */
        scopedUniversityIds: (state) =>
            state.universityId == null
                ? []
                : [state.universityId, ...state.descendantIds],
    },

    actions: {
        reset() {
            this.$reset();
            contextLoadPromise = null;
        },

        /**
         * Fetches the centric context for the university in the JWT.
         * Never throws — the router guard must not be blocked by a failure here.
         */
        async fetchContext() {
            if (contextLoadPromise) return contextLoadPromise;

            this.loading = true;
            const token = localStorage.getItem("accessToken");

            contextLoadPromise = (async () => {
                try {
                    // Runs on every navigation — never surface a toast for it.
                    const response = await apiGet(
                        "sis_api/CentricUniversity/Context",
                        { headers: { disableToast: true } },
                    );
                    const data = response?.data?.singleObject;
                    if (!data) return;

                    this.universityId = data.universityId ?? null;
                    this.nameAr = data.nameAr ?? null;
                    this.nameEn = data.nameEn ?? null;
                    this.isCentric = Boolean(data.isCentric);
                    this.descendants = data.descendants ?? [];
                    this.descendantIds = data.descendantIds ?? [];
                    this.loaded = true;
                    this.resolvedForToken = token;
                } catch (error) {
                    console.error("Failed to load centric university context:", error);
                } finally {
                    this.loading = false;
                    contextLoadPromise = null;
                }
            })();

            return contextLoadPromise;
        },

        /**
         * Called from the navigation guard on every page entry. Re-fetches only when the
         * context is missing or the token changed, so navigation stays cheap.
         */
        async ensureContextLoaded() {
            const token = localStorage.getItem("accessToken");
            // UniversityId only exists on the scoped token minted by Context/activate —
            // on the identity token (login / role-select) the endpoint would 401.
            if (!token || !isScopedAuthToken(token)) return;
            if (this.loaded && this.resolvedForToken === token) return;
            await this.fetchContext();
        },
    },
});
