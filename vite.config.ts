import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// process is a Node.js global in the Vite config context
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
	plugins: [preact(), tailwindcss(), tsconfigPaths()],
	assetsInclude: ["**/*.mpeg"],
	build: {
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
					// Keep Preact in the main vendor chunk to avoid circular chunk dependencies.
					if (id.includes("@preact/") || id.includes("preact")) return "vendor";

					return "vendor";
				},
			},
		},
	},

	resolve: {
		alias: {
			react: "preact/compat",
			"react-dom": "preact/compat",
			"react-dom/client": "preact/compat/client",
			"react-dom/test-utils": "preact/test-utils",
			"react/jsx-runtime": "preact/jsx-runtime",
			"react/jsx-dev-runtime": "preact/jsx-dev-runtime",
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
