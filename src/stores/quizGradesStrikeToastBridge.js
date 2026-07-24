import { defineStore } from "pinia";

/**
 * Bridges PrimeVue Toast (App-level onClick) to the grades report table proctoring dialog.
 */
export const useQuizGradesStrikeToastBridge = defineStore("quizGradesStrikeToastBridge", {
    state: () => ({
        openProctoringHandler: null,
    }),
    actions: {
        setOpenProctoringHandler(fn) {
            this.openProctoringHandler = typeof fn === "function" ? fn : null;
        },
        clearOpenProctoringHandler() {
            this.openProctoringHandler = null;
        },
        handleToastClick(payload) {
            const originalEvent = payload?.originalEvent;
            if (originalEvent?.target?.closest?.("button")) {
                return;
            }
            const student = payload?.message?.strikeProctoringStudent;
            const fn = this.openProctoringHandler;
            if (student && fn) {
                fn(student);
            }
        },
    },
});
