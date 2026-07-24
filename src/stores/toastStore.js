import { defineStore } from "pinia";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
export const useToastStore = defineStore("toast", {
    state: () => ({
        toast: useToast(),
        router: useRouter(),
    }),
    actions: {
        addSuccessToast(message) {
            this.toast.add({
                severity: "success",
                summary: "Success",
                detail: message,
                life: 3000,
            });
        },
        addErrorToast(message) {
            this.toast.add({
                severity: "error",
                summary: "Error",
                detail: message,
                life: 3000,
            });
        },
        addWarningToast(message) {
            this.toast.add({
                severity: "warn",
                summary: "Warning",
                detail: message,
                life: 3000,
            });
        },
        redirectToLogin() {
            this.router.replace("/login");
        },
    },
});
