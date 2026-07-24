import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import AutoImport from "unplugin-auto-import/vite";
import tailwindcss from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";

//import { VitePWA } from 'vite-plugin-pwa'
//import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const isDev = mode === "development";

    return {
        base: process.env.VITE_BASE_PATH || "/", // Use relative paths for Electron
        plugins: [
            vue(),
            ...(isDev ? [vueDevTools()] : []),
            tailwindcss(),
            AutoImport({
                dts: true,
                dirs: ["src/stores", "src/utilities", "src/volt", "src/composables"],
                imports: [
                    "vue",
                    "vue-router",
                    "vue-i18n",
                    "vee-validate",
                    {
                        "primevue/usetoast": ["useToast"],
                    },
                ],
            }),
            Components({
                dts: true,
                dirs: ["src/components", "src/volt"],
            }),
            // federation({
            //     name: "root",
            //     filename: "remoteEntry.js",
            //     exposes: {
            //       "./exports": "./src/utilities/exports.js",
            //       "./api":"./src/utilities/fetchApi.js"
            //     },
            //     shared: ["vue", "vue-router","pinia", "lucide-vue-next", "axios"],
            //   }),
            // VitePWA({ 
            //     registerType: 'autoUpdate',
            //     includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
            //     manifest: {
            //         name: "MSDC-SIS",
            //         short_name: "MSDC-SIS",
            //         description: "MSDC-SIS",
            //         theme_color: "#000000",
            //         // display: "standalone",
            //         // orientation: "any",
            //         icons: [
            //             {
            //               src: "android-chrome-192x192.png",
            //               sizes: "192x192",
            //               type: "image/png",
            //             },
            //             {
            //               src: "android-chrome-512x512.png",
            //               sizes: "512x512",
            //               type: "image/png",
            //             },
            //           ],
            //     },
            //       devOptions: {
            //         enabled: false,
            //         type: 'module',
            //       },
            // })
        ],
        esbuild: {
            drop: isDev ? [] : ["console", "debugger"],
        },
        build: {
            sourcemap: isDev,
        },
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
                "@volt": fileURLToPath(new URL("./src/volt", import.meta.url)),
                "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
                "@utilities": fileURLToPath(new URL("./src/utilities", import.meta.url)),
                "@stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
                "@router": fileURLToPath(new URL("./src/router", import.meta.url)),
                "@views": fileURLToPath(new URL("./src/views", import.meta.url)),
                "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
                "@projects": fileURLToPath(new URL("./src/projects", import.meta.url)),
            },
        },
    };
});
