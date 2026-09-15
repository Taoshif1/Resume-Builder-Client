import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

if (!process.env.VERCEL) {
  // Existing shell values win; backend settings win over frontend defaults.
  for (const name of [".env.server", ".env.local", ".env"]) {
    try {
      loadEnvFile(fileURLToPath(new URL("../" + name, import.meta.url)));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}
