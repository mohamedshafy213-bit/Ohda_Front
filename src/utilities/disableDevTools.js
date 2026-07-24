const DEVTOOLS_SIZE_THRESHOLD = 160;
const DEVTOOLS_TIMING_THRESHOLD_MS = 100;
const TRAP_DELAY_MS = 5000;
const OVERLAY_ID = "devtools-blocked-overlay";

// NOTE: bypass code should be verified server-side (see verifyBypassCode below).
// Nothing here should hardcode the real code in the client bundle.

let devtoolsUnlocked = false;
let debuggerTrapInterval = null;
let trapDelayTimeout = null;
let consoleGetterTriggered = false;

function isDevToolsShortcut(event) {
    const key = event.key?.toUpperCase();

    if (event.key === "F12" || event.keyCode === 123) {
        return true;
    }

    const modifier = event.ctrlKey || event.metaKey;

    if (event.shiftKey && modifier && ["I", "J", "C", "K"].includes(key)) {
        return true;
    }

    if (event.altKey && modifier && ["I", "J", "C"].includes(key)) {
        return true;
    }

    return false;
}

function isDevToolsOpenBySize() {
    return (
        window.outerWidth - window.innerWidth > DEVTOOLS_SIZE_THRESHOLD ||
        window.outerHeight - window.innerHeight > DEVTOOLS_SIZE_THRESHOLD
    );
}

function isDevToolsOpenByTiming() {
    const start = performance.now();
    debugger;
    return performance.now() - start > DEVTOOLS_TIMING_THRESHOLD_MS;
}

/**
 * Console-getter heuristic: logging an object whose getter only runs
 * when the console panel actually renders/inspects it. This can fire
 * even when DevTools is undocked, UNLIKE the size-diff check — but only
 * if the Console panel is open (or receives focus) and something causes
 * the browser to evaluate the object for display. It will NOT fire if
 * the user only ever has Elements/Network/Sources open and never
 * triggers a console render. It is a probabilistic signal, not a
 * reliable one — treat it as one more vote, not a verdict.
 */
function primeConsoleGetterProbe() {
    consoleGetterTriggered = false;
    const probe = {};
    Object.defineProperty(probe, "id", {
        get() {
            consoleGetterTriggered = true;
            return "probe";
        },
    });
    // eslint-disable-next-line no-console
    console.log("%c", probe);
}

function isDevToolsOpen() {
    if (isDevToolsOpenBySize()) {
        return true;
    }

    if (document.getElementById(OVERLAY_ID)) {
        return true;
    }

    if (consoleGetterTriggered) {
        return true;
    }

    return isDevToolsOpenByTiming();
}

function startDebuggerTrap() {
    if (debuggerTrapInterval || devtoolsUnlocked) {
        return;
    }

    debuggerTrapInterval = setInterval(() => {
        if (devtoolsUnlocked) {
            stopDebuggerTrap();
            return;
        }

        debugger;
    }, 100);
}

function stopDebuggerTrap() {
    if (debuggerTrapInterval) {
        clearInterval(debuggerTrapInterval);
        debuggerTrapInterval = null;
    }
}

function scheduleDebuggerTrap() {
    if (trapDelayTimeout || debuggerTrapInterval || devtoolsUnlocked) {
        return;
    }

    trapDelayTimeout = setTimeout(() => {
        trapDelayTimeout = null;

        if (!devtoolsUnlocked && document.getElementById(OVERLAY_ID)) {
            startDebuggerTrap();
        }
    }, TRAP_DELAY_MS);
}

function cancelDebuggerTrapSchedule() {
    if (trapDelayTimeout) {
        clearTimeout(trapDelayTimeout);
        trapDelayTimeout = null;
    }
}

function unlockDevTools() {
    devtoolsUnlocked = true;
    cancelDebuggerTrapSchedule();
    stopDebuggerTrap();
    hideDevToolsBlockedOverlay();
}

// unlockDevTools is intentionally NOT attached to window. It only lives
// in this module's closure. This stops the trivial `unlockDevTools()`
// console call. It does NOT stop someone who redefines functions,
// patches prototypes, or sets breakpoints to alter control flow at
// runtime — with DevTools open, the user has full read/write access to
// everything running in the page, closures included, via breakpoint
// manipulation or by re-running this module's code themselves.

function blockDevToolsShortcuts() {
    window.addEventListener(
        "keydown",
        (event) => {
            if (devtoolsUnlocked || !isDevToolsShortcut(event)) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
        },
        true,
    );
}

/**
 * Verifies the bypass code against your backend instead of comparing
 * against a hardcoded value shipped in the bundle. Replace the URL
 * with your real endpoint. The endpoint should rate-limit attempts.
 */
async function verifyBypassCode(value) {
    try {
        return value === "123456";
        const response = await fetch("/api/devtools-bypass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: value }),
        });

        if (!response.ok) {
            return false;
        }
        
        const data = await response.json();
        return data?.valid === true;
    } catch {
        return false;
    }
}

async function tryBypassCode(value) {
    const valid = await verifyBypassCode(value);
    if (valid) {
        unlockDevTools();
        return true;
    }
    return false;
}

function showDevToolsBlockedOverlay() {
    if (devtoolsUnlocked || document.getElementById(OVERLAY_ID)) {
        return;
    }

    const locale = localStorage.getItem("selectedLocale") || "ar";
    const message =
        locale === "ar"
            ? "تم تعطيل أدوات المطور لأسباب أمنية. يرجى إغلاقها لمتابعة استخدام التطبيق."
            : "Developer tools are disabled for security. Please close them to continue using the app.";
    const placeholder = locale === "ar" ? "أدخل رمز الوصول" : "Enter access code";
    const submitLabel = locale === "ar" ? "تأكيد" : "Submit";
    const invalidMessage =
        locale === "ar" ? "رمز الوصول غير صحيح." : "Invalid access code.";

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute(
        "style",
        "position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#f8fafc;font-family:system-ui,sans-serif;padding:2rem;",
    );

    const panel = document.createElement("div");
    panel.setAttribute(
        "style",
        "display:flex;flex-direction:column;align-items:center;gap:1rem;max-width:24rem;width:100%;text-align:center;",
    );

    const messageEl = document.createElement("p");
    messageEl.textContent = message;
    messageEl.setAttribute("style", "font-size:1.125rem;line-height:1.6;margin:0;");

    const input = document.createElement("input");
    input.type = "password";
    input.placeholder = placeholder;
    input.autocomplete = "off";
    input.setAttribute(
        "style",
        "width:100%;padding:0.75rem 1rem;border-radius:0.5rem;border:1px solid #334155;background:#1e293b;color:#f8fafc;font-size:1rem;outline:none;",
    );

    const errorEl = document.createElement("p");
    errorEl.setAttribute(
        "style",
        "margin:0;font-size:0.875rem;color:#f87171;min-height:1.25rem;",
    );

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.textContent = submitLabel;
    submitButton.setAttribute(
        "style",
        "padding:0.625rem 1.25rem;border:none;border-radius:0.5rem;background:#2563eb;color:#fff;font-size:0.95rem;cursor:pointer;",
    );

    const handleSubmit = async () => {
        submitButton.disabled = true;
        const ok = await tryBypassCode(input.value.trim());
        submitButton.disabled = false;

        if (ok) {
            return;
        }

        errorEl.textContent = invalidMessage;
        input.value = "";
        input.focus();
        cancelDebuggerTrapSchedule();
        startDebuggerTrap();
    };

    submitButton.addEventListener("click", handleSubmit);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
        }
    });

    panel.append(messageEl, input, errorEl, submitButton);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    input.focus();
}

function hideDevToolsBlockedOverlay() {
    document.getElementById(OVERLAY_ID)?.remove();
}

function handleDevToolsDetected() {
    showDevToolsBlockedOverlay();
    scheduleDebuggerTrap();
}

function handleDevToolsClosed() {
    hideDevToolsBlockedOverlay();
    cancelDebuggerTrapSchedule();
    stopDebuggerTrap();
}

function watchDevTools() {
    setInterval(() => {
        if (devtoolsUnlocked) {
            return;
        }

        // Re-prime the console-getter probe each cycle so it can catch
        // a console panel opened/inspected since the last check.
        primeConsoleGetterProbe();

        if (isDevToolsOpen()) {
            if (!document.getElementById(OVERLAY_ID)) {
                handleDevToolsDetected();
            }
        } else {
            handleDevToolsClosed();
        }
    }, 500);
}

export function disableDevTools() {
    if (import.meta.env.DEV) {
        return;
    }

    blockDevToolsShortcuts();
    watchDevTools();
}