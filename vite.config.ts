import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// process is a Node.js global in the Vite config context
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
	assetsInclude: ["**/*.mpeg"],
  build: {
    target:
          process.env.TAURI_ENV_PLATFORM == 'windows'
            ? 'chrome105'
            : 'safari13',
        // don't minify for debug builds
    minify: !process.env.TAURI_ENV_DEBUG,
        // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
		reportCompressedSize: true,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;

					if (id.includes("@supabase/supabase-js")) return "supabase";
					if (
						id.includes("@radix-ui/") ||
						id.includes("radix-ui") ||
						id.includes("@floating-ui/")
					)
						return "radix";
					if (id.includes("html-to-image")) return "export";
					if (id.includes("lucide-react")) return "icons";
					if (id.includes("html5-qrcode")) return "qr";
					if (id.includes("react-toastify")) return "toast";

					return "vendor";
				},
			},
		},
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent Vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			// 3. tell Vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	},
}));
