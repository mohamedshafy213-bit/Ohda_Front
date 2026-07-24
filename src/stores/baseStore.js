import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { apiGet } from "@/utilities/fetchApi.js";
import { getActivePersonUniversityId } from "@/utilities/authTokens.js";
import {
    decodeJwtPayload,
    extractRealmRolesFromPayload,
} from "@/composables/useAllowedControls.js";

/**
 * Copy of menu tree keeping only leaves whose `key` is in `allowed`
 * (sections/submenus kept only if they still have visible children).
 */
function filterMenuByAllowedPages(menuRoots, allowed) {
    const allowedSet = new Set(allowed ?? []);

    function filterItems(items) {
        if (!items?.length) return [];
        const out = [];
        for (const item of items) {
            if (item.items?.length) {
                const children = filterItems(item.items);
                if (children.length) {
                    out.push({ ...item, items: children });
                }
            } else if (item.to && allowedSet.has(item.key)) {
                out.push(item);
            }
        }
        return out;
    }

    return (menuRoots ?? [])
        .map((section) => {
            if (!section.items?.length) return null;
            const items = filterItems(section.items);
            return items.length ? { ...section, items } : null;
        })
        .filter(Boolean);
}

function flattenMenuModelPaths(menuRoots) {
    const paths = [];
    function walk(items) {
        if (!items?.length) return;
        for (const item of items) {
            if (item.items?.length) {
                walk(item.items);
            } else if (item.to) {
                paths.push(item.to);
            }
        }
    }
    for (const section of menuRoots ?? []) {
        if (section.items?.length) walk(section.items);
    }
    return paths;
}

function pathMatchesAllowedMenuRoute(path, allowedPaths) {
    const normalized = (path || "/").replace(/\/$/, "") || "/";
    if (!allowedPaths.length) return false;
    const sorted = [...allowedPaths].sort((a, b) => b.length - a.length);
    for (const base of sorted) {
        const nb = (base || "/").replace(/\/$/, "") || "/";
        if (normalized === nb) return true;
        if (nb !== "/" && normalized.startsWith(`${nb}/`)) return true;
    }
    return false;
}

function normalizeStandalonePathEntry(entry) {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object") {
        const p = entry.to ?? entry.path ?? entry.route ?? entry.url;
        if (typeof p === "string") return p;
    }
    return null;
}

function parseUserPagesResponse(responseData) {
    const raw =
        responseData?.singleObject ?? responseData?.SingleObject ?? null;
    const tree = raw?.shownInSidebar ?? [];
    const standalone =
        raw?.hiddenFromSidebar ??
        raw?.hiddenInSidebar ??
        [];
    return {
        menuTree: Array.isArray(tree) ? tree : [],
        standalonePages: Array.isArray(standalone) ? standalone : [],
    };
}

function filterStandaloneByAllowedJwt(standaloneList, allowedSet) {
    const out = [];
    for (const entry of standaloneList ?? []) {
        if (entry && typeof entry === "object") {
            const key = entry.key;
            if (typeof key !== "string" || key === "") continue;
            if (!allowedSet.has(key)) continue;
            out.push(entry);
        }
    }
    return out;
}

function mergeAllowedPathsFromTreeAndStandalone(menuRoots, standaloneList) {
    const fromTree = flattenMenuModelPaths(menuRoots);
    const seen = new Map();
    const add = (path) => {
        if (typeof path !== "string" || !path) return;
        const norm = path.replace(/\/$/, "") || "/";
        if (!seen.has(norm)) seen.set(norm, path);
    };
    for (const p of fromTree) add(p);
    for (const entry of standaloneList) {
        const p = normalizeStandalonePathEntry(entry);
        if (p) add(p);
    }
    return [...seen.values()];
}

let userPagesLoadPromise = null;

export const useBaseStore = defineStore("base", {
    state: () => ({
        dateRange: {
            fromDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            toDate: new Date(),
        },
        user: null,
        universityName: localStorage.getItem("universityName") || "",
        router: useRouter(),
        currentPathPermissions: [],
        entityConfiguration: null,
        /** Realm roles `p_*` from JWT; must match menu leaf `key` */
        allowedMenuPageNames: [],
        /** Realm roles with prefix c_; UI controls / actions (JWT) */
        allowedControls: [],
        /** Sidebar menu from GET /secPages/menuModelAll */
        menuModelAll: [],
        /** Allowed routes not listed in the sidebar tree */
        extraNavigablePagePaths: [],
        /** Cached merge of sidebar + extra paths for route checks */
        allowedMenuPathsFlat: [],
        userPagesFetched: false,
        /** Changes when the user activates a different role/context */
        activeContextId: getActivePersonUniversityId(),
    }),
    actions: {
        syncActiveContextId() {
            this.activeContextId = getActivePersonUniversityId();
        },

        applyPermissionsFromAccessToken(token) {
            const payload = decodeJwtPayload(token);
            if (!payload) {
                this.clearPermissionRoles();
                return;
            }
            const { allowedMenuPageNames, allowedControls } =
                extractRealmRolesFromPayload(payload);
            this.allowedMenuPageNames = allowedMenuPageNames;
            this.allowedControls = allowedControls;
            this.rebuildAllowedMenuPathsFlat();
        },

        clearPermissionRoles() {
            userPagesLoadPromise = null;
            this.allowedMenuPageNames = [];
            this.allowedControls = [];
            this.menuModelAll = [];
            this.extraNavigablePagePaths = [];
            this.allowedMenuPathsFlat = [];
            this.userPagesFetched = false;
            this.activeContextId = null;
        },

        rebuildAllowedMenuPathsFlat() {
            const filteredMenu = filterMenuByAllowedPages(
                this.menuModelAll,
                this.allowedMenuPageNames,
            );
            const allowedSet = new Set(this.allowedMenuPageNames ?? []);
            const standaloneFiltered = filterStandaloneByAllowedJwt(
                this.extraNavigablePagePaths,
                allowedSet,
            );
            this.allowedMenuPathsFlat = mergeAllowedPathsFromTreeAndStandalone(
                filteredMenu,
                standaloneFiltered,
            );
        },

        async fetchUserPages() {
            if (userPagesLoadPromise) return userPagesLoadPromise;
            userPagesLoadPromise = (async () => {
                try {
                    const res = await apiGet("/sec_api/SecPage/MenuModelAll");
                    const { menuTree, standalonePages } =
                        parseUserPagesResponse(res?.data);
                    this.menuModelAll = menuTree;
                    this.extraNavigablePagePaths = standalonePages;
                    this.rebuildAllowedMenuPathsFlat();
                    this.userPagesFetched = true;
                } catch {
                    this.menuModelAll = [];
                    this.extraNavigablePagePaths = [];
                    this.allowedMenuPathsFlat = [];
                    this.userPagesFetched = false;
                } finally {
                    userPagesLoadPromise = null;
                }
            })();
            return userPagesLoadPromise;
        },

        async ensureUserPagesLoaded() {
            if (!localStorage.getItem("accessToken")) return;
            if (this.userPagesFetched) return;
            await this.fetchUserPages();
        },

        async reloadUserPages() {
            await userPagesLoadPromise;
            this.userPagesFetched = false;
            await this.fetchUserPages();
        },

        getFirstAllowedMenuPath() {
            return this.allowedMenuPathsFlat[0] ?? null;
        },

        getAllowedMenuPathsFlat() {
            return this.allowedMenuPathsFlat;
        },

        isPathAllowedByMenuPermissions(path) {
            return pathMatchesAllowedMenuRoute(path, this.allowedMenuPathsFlat);
        },

        navigateToFirstAllowedPage() {
            const path = this.allowedMenuPathsFlat[0] || "/";
            this.router.push(path);
        },

        syncPermissionsFromStoredToken() {
            const token = localStorage.getItem("accessToken");
            if (token) this.applyPermissionsFromAccessToken(token);
            else this.clearPermissionRoles();
        },

        async getUser() {
            try {
                const response = await apiGet("/sis_api/Person/GetFullName");
                const sisUser = response.data?.singleObject;
                if (sisUser) {
                    if (this.user) {
                        // Merge imagePath into the already-loaded user (from sec_api /user/GET)
                        this.user = {
                            ...this.user,
                            imagePath: sisUser.imagePath,
                            fullName: sisUser.fullName,
                        };
                    } else {
                        this.user = sisUser;
                    }
                    localStorage.setItem("user", JSON.stringify(this.user));
                }
            } catch (e) {
                // non-critical – ignore
            }
        },
        /** Breadcrumb chain from menu tree: walk `menuModelAll`, match route to `to`, include section/item names from the tree. */
        getBreadcrumbs(currentPath, locale = "en") {
            const breadcrumbs = [];
            const normalizedPath =
                currentPath.replace(/\/$/, "").replace(/^#/, "") || "/";

            if (normalizedPath === "/") return breadcrumbs;

            const findItemByPath = (items, path, parentPath = []) => {
                for (const item of items) {
                    const currentPathChain = [...parentPath, item];
                    const itemPath = item.to
                        ? item.to.replace(/\/$/, "")
                        : null;

                    if (itemPath === path) {
                        return currentPathChain;
                    }

                    if (item.items?.length) {
                        const childResult = findItemByPath(
                            item.items,
                            path,
                            currentPathChain,
                        );
                        if (childResult) return childResult;
                    }

                    if (itemPath && path.startsWith(`${itemPath}/`)) {
                        if (item.items?.length) {
                            const childResult = findItemByPath(
                                item.items,
                                path,
                                currentPathChain,
                            );
                            if (
                                childResult &&
                                childResult.length > currentPathChain.length
                            ) {
                                return childResult;
                            }
                        }
                        return currentPathChain;
                    }
                }
                return null;
            };

            for (const rootItem of this.menuModelAll) {
                if (!rootItem.items?.length) continue;
                const result = findItemByPath(rootItem.items, normalizedPath, [
                    rootItem,
                ]);
                if (!result?.length) continue;

                result.forEach((item) => {
                    const name =
                        locale === "ar" && item.nameAr
                            ? item.nameAr
                            : item.nameEn || item.label || "";
                    breadcrumbs.push({
                        name,
                        path: item.to || null,
                    });
                });
                break;
            }

            return breadcrumbs;
        },
    },
    getters: {
        menuModel(state) {
            return filterMenuByAllowedPages(
                state.menuModelAll,
                state.allowedMenuPageNames,
            );
        },
        getMenuModel() {
            return this.menuModel;
        },
        hasAllowedControl: (state) => (controlKey) =>
            state.allowedControls.includes(controlKey),
    },
});
