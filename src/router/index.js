import { createRouter, createWebHistory } from "vue-router";
import ohdaRoutes from "@/projects/ohda/router";
import { useOhdaAuthStore } from "@/projects/ohda/stores/useOhdaAuthStore";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            redirect: "/ohda/login"
        },
        {
            path: "/login",
            redirect: "/ohda/login"
        },
        ...ohdaRoutes,
        {
            path: "/:pathMatch(.*)*",
            redirect: "/ohda/login"
        }
    ],
});

router.beforeEach(async (to, from, next) => {
    const isOhdaLogin = to.path === "/ohda/login";
    const token = localStorage.getItem("accessToken");
    const ohdaUser = localStorage.getItem("ohdaUser");

    // If navigating to an ohda protected page and no user session, redirect to login
    if (!isOhdaLogin && !token && !ohdaUser) {
        return next("/ohda/login");
    }

    // Enforce dynamic allowedPages permission checks for Ohda routes
    if (to.path.startsWith("/ohda") && !isOhdaLogin) {
        const authStore = useOhdaAuthStore();

        // Fetch pages dynamically from database if state/cache is empty
        if (authStore.isAuthenticated && (!authStore.allowedPages || authStore.allowedPages.length === 0)) {
            await authStore.fetchMyPages();
        }

        const allowedPaths = authStore.allowedPaths;

        if (!allowedPaths.includes(to.path)) {
            console.warn(`Blocked access to unauthorized route: ${to.path}`);
            if (allowedPaths.includes("/ohda/dashboard")) {
                return next("/ohda/dashboard");
            } else if (allowedPaths.length > 0) {
                return next(allowedPaths[0]);
            } else {
                return next("/ohda/login");
            }
        }
    }

    next();
});

export default router;
