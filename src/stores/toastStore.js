import { defineStore } from "pinia";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import i18n from "@/i18n";

export const useToastStore = defineStore("toast", {
    state: () => ({
        toast: null,
        router: null,
        lastToastKey: "",
        lastToastTime: 0
    }),
    actions: {
        init() {
            if (!this.toast) {
                try {
                    this.toast = useToast();
                } catch (e) {
                    // Handled outside component context
                }
            }
            if (!this.router) {
                try {
                    this.router = useRouter();
                } catch (e) {}
            }
        },
        _shouldThrottle(message, severity) {
            const key = `${severity}:${message}`;
            const now = Date.now();
            if (this.lastToastKey === key && now - this.lastToastTime < 1800) {
                return true;
            }
            this.lastToastKey = key;
            this.lastToastTime = now;
            return false;
        },
        getSummary(severity) {
            const locale = i18n.global.locale.value || "ar";
            const isAr = locale === "ar";
            switch (severity) {
                case "success":
                    return isAr ? "تمت العملية بنجاح" : "Success";
                case "error":
                    return isAr ? "حدث خطأ" : "Error";
                case "warn":
                    return isAr ? "تنبيه" : "Warning";
                case "info":
                default:
                    return isAr ? "معلومة" : "Information";
            }
        },
        addSuccessToast(message, summary) {
            this.init();
            if (!message || this._shouldThrottle(message, "success")) return;
            this.toast?.add({
                severity: "success",
                summary: summary || this.getSummary("success"),
                detail: message,
                life: 3500,
            });
        },
        addErrorToast(message, summary) {
            this.init();
            if (!message || this._shouldThrottle(message, "error")) return;
            this.toast?.add({
                severity: "error",
                summary: summary || this.getSummary("error"),
                detail: message,
                life: 5000,
            });
        },
        addWarningToast(message, summary) {
            this.init();
            if (!message || this._shouldThrottle(message, "warn")) return;
            this.toast?.add({
                severity: "warn",
                summary: summary || this.getSummary("warn"),
                detail: message,
                life: 4000,
            });
        },
        addInfoToast(message, summary) {
            this.init();
            if (!message || this._shouldThrottle(message, "info")) return;
            this.toast?.add({
                severity: "info",
                summary: summary || this.getSummary("info"),
                detail: message,
                life: 3500,
            });
        },
        redirectToLogin() {
            this.init();
            this.router?.replace("/ohda/login");
        },
    },
});

