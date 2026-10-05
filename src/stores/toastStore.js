import { defineStore } from "pinia";
import ToastEventBus from "primevue/toasteventbus";
import i18n from "@/i18n";

export const useToastStore = defineStore("toast", {
    state: () => ({
        lastToastKey: "",
        lastToastTime: 0
    }),
    actions: {
        _normalizeToastArgs(messageOrObj, summary) {
            if (messageOrObj && typeof messageOrObj === "object") {
                const msg = messageOrObj.message || messageOrObj.detail || messageOrObj.text || "";
                const sum = messageOrObj.summary || messageOrObj.title || summary;
                return {
                    message: typeof msg === "string" ? msg : JSON.stringify(msg),
                    summary: sum
                };
            }
            return {
                message: typeof messageOrObj === "string" ? messageOrObj : String(messageOrObj || ""),
                summary: summary
            };
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
        _emitToast(payload) {
            try {
                ToastEventBus.emit("add", payload);
            } catch (e) {
                console.error("[ToastStore Emit Error]:", e);
            }
        },
        addSuccessToast(message, summary) {
            const { message: msg, summary: sum } = this._normalizeToastArgs(message, summary);
            if (!msg || this._shouldThrottle(msg, "success")) return;
            this._emitToast({
                severity: "success",
                summary: sum || this.getSummary("success"),
                detail: msg,
                life: 3500,
            });
        },
        addErrorToast(message, summary) {
            const { message: msg, summary: sum } = this._normalizeToastArgs(message, summary);
            if (!msg || this._shouldThrottle(msg, "error")) return;
            this._emitToast({
                severity: "error",
                summary: sum || this.getSummary("error"),
                detail: msg,
                life: 5000,
            });
        },
        addWarningToast(message, summary) {
            const { message: msg, summary: sum } = this._normalizeToastArgs(message, summary);
            if (!msg || this._shouldThrottle(msg, "warn")) return;
            this._emitToast({
                severity: "warn",
                summary: sum || this.getSummary("warn"),
                detail: msg,
                life: 4000,
            });
        },
        addInfoToast(message, summary) {
            const { message: msg, summary: sum } = this._normalizeToastArgs(message, summary);
            if (!msg || this._shouldThrottle(msg, "info")) return;
            this._emitToast({
                severity: "info",
                summary: sum || this.getSummary("info"),
                detail: msg,
                life: 3500,
            });
        },
        redirectToLogin() {
            window.location.assign("/ohda/login");
        },
    },
});


