// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// Load environment variables so the proxy can securely access your Shopify token
const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      proxy: {
        "/api/shopify": {
          target: "https://easystock-dev-2wcte9hv.myshopify.com/admin/api/2026-10/graphql.json",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shopify/, ""),
          headers: {
            // The proxy injects the token here, keeping it completely hidden from the browser
            "X-Shopify-Access-Token": env.VITE_SHOPIFY_TOKEN || "",
          },
        },
      },
    },
  },
});
