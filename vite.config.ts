import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    build: {
      target: "ES2022",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-tanstack": [
              "@tanstack/react-router",
              "@tanstack/react-query",
              "@tanstack/react-start",
            ],
            "vendor-ui": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
            ],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    ssr: {
      noExternal: ["@radix-ui"],
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
