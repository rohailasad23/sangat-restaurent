import { existsSync } from "fs";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) {
    try { process.loadEnvFile(f); } catch { /* ignore */ }
  }
}
