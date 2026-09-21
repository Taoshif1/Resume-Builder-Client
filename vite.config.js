import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { assertNoProductionEmulators } from "./config/deployment.js";

export default defineConfig(({ command, mode }) => {
  if (command === "build")
    assertNoProductionEmulators({ ...loadEnv(mode, process.cwd(), ""), ...process.env });
  return {
    server: {
      port: 5173,
      strictPort: true,
      proxy: { "/api": "http://127.0.0.1:3000" },
    },
    plugins: [react(), tailwindcss()],
  };
});
