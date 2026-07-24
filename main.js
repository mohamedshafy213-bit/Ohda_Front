import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

app.whenReady().then(() => {
    // Set icon path based on environment
    const iconPath = app.isPackaged
        ? join(__dirname, "dist", "favicon", "android-chrome-512x512.png")
        : join(__dirname, "public", "favicon", "android-chrome-512x512.png");

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: !app.isPackaged,
        },
    });

    if (app.isPackaged) {
        mainWindow.webContents.on("devtools-opened", () => {
            mainWindow.webContents.closeDevTools();
            mainWindow.webContents.reload();
        });

        mainWindow.webContents.on("before-input-event", (event, input) => {
            const key = input.key?.toUpperCase();
            const modifier = input.control || input.meta;

            if (
                input.key === "F12" ||
                (input.shift && modifier && ["I", "J", "C", "K"].includes(key)) ||
                (input.alt && modifier && ["I", "J", "C"].includes(key))
            ) {
                event.preventDefault();
            }
        });
    }

    // Load from dev server in development, or from built files in production
    if (process.env.NODE_ENV === "development" || !app.isPackaged) {
        mainWindow.loadURL("http://localhost:5173");
        mainWindow.webContents.openDevTools(); // Open DevTools in development
    } else {
        const indexPath = join(__dirname, "dist", "index.html");
        console.log("Loading from:", indexPath);
        console.log("App is packaged:", app.isPackaged);
        console.log("__dirname:", __dirname);

        mainWindow.loadFile(indexPath).catch((err) => {
            console.error("Failed to load file:", err);
        });
    }

    // Log any errors
    mainWindow.webContents.on(
        "did-fail-load",
        (event, errorCode, errorDescription) => {
            console.error("Failed to load:", errorCode, errorDescription);
        }
    );
});
