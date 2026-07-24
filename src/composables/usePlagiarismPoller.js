import { ref, computed, watch, onBeforeUnmount } from "vue";
import { usePlagiarismStore, isTerminalStatus } from "@/projects/sis/stores/plagiarismStore.js";

/**
 * Shared 3-second poller for a set of PlagiarismCheck rows.
 *
 * Pass a reactive `getRows()` returning the rows currently rendered on the page.
 * The composable maintains a single setInterval that polls every non-terminal
 * row, suspends while the tab is hidden, and tolerates transient errors
 * (`status` only stops the poll once it becomes "completed" or "failed").
 */
export function usePlagiarismPoller(getRows, { intervalMs = 3000 } = {}) {
    const store = usePlagiarismStore();
    const isPolling = ref(false);

    let timerId = null;
    let inFlight = false;
    // Consecutive transient-error count — used to exponentially back off so we
    // don't hammer a flapping service. Reset on the first successful tick.
    let consecutiveErrors = 0;
    const MAX_BACKOFF_MS = 30000;

    const activeIds = computed(() => {
        const rows = getRows() ?? [];
        return rows
            .filter((r) => r?.id && !isTerminalStatus(r.status))
            .map((r) => Number(r.id));
    });

    const visible = () =>
        typeof document === "undefined" || document.visibilityState === "visible";

    const currentDelay = () =>
        Math.min(MAX_BACKOFF_MS, intervalMs * Math.pow(2, consecutiveErrors));

    const tick = async () => {
        if (inFlight) {
            scheduleNext();
            return;
        }
        if (!visible()) return;
        const ids = activeIds.value;
        if (ids.length === 0) {
            stop();
            return;
        }
        inFlight = true;
        let anyError = false;
        try {
            const results = await Promise.allSettled(
                ids.map((id) => store.fetchStatus(id))
            );
            anyError = results.some((r) => r.status === "rejected");
        } finally {
            inFlight = false;
        }
        if (anyError) consecutiveErrors = Math.min(consecutiveErrors + 1, 6);
        else consecutiveErrors = 0;
        scheduleNext();
    };

    const scheduleNext = () => {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
        if (activeIds.value.length === 0) {
            isPolling.value = false;
            return;
        }
        if (!visible()) return;
        timerId = setTimeout(tick, currentDelay());
    };

    const start = () => {
        if (timerId || activeIds.value.length === 0) return;
        isPolling.value = true;
        // Run an immediate tick so the UI updates without waiting for the first interval.
        tick();
    };

    const stop = () => {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
        consecutiveErrors = 0;
        isPolling.value = false;
    };

    const onVisibilityChange = () => {
        if (visible()) {
            if (activeIds.value.length > 0) start();
        } else {
            stop();
        }
    };

    if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", onVisibilityChange);
    }

    watch(activeIds, (ids) => {
        if (ids.length === 0) {
            stop();
        } else if (!timerId && visible()) {
            start();
        }
    });

    onBeforeUnmount(() => {
        stop();
        if (typeof document !== "undefined") {
            document.removeEventListener("visibilitychange", onVisibilityChange);
        }
    });

    return { isPolling, start, stop };
}
