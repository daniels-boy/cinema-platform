// Carrega .env.local apenas quando rodado via CLI (não afeta o build da Vercel)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { config } = require("dotenv");
    config({ path: ".env.local", override: false });
    config({ path: ".env", override: false });
  } catch {
    // dotenv pode não estar disponível em todos os ambientes
  }
}

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"] ?? "",
  },
});
