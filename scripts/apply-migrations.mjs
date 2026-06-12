// Applies pending Drizzle migrations over the Neon HTTP driver.
//
// Why not `drizzle-kit migrate`: it uses the @neondatabase/serverless websocket
// driver, which hangs in this environment (see CLAUDE.md). This script mirrors
// drizzle's migrator logic: a migration is applied iff the sha256 of its .sql
// content exists as a hash in drizzle.__drizzle_migrations.
//
// Usage: set -a && . ./.env.local && set +a && node scripts/apply-migrations.mjs

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const DUPLICATE_ERROR_CODES = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object
  "42701", // duplicate_column
]);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Load .env.local first.");
  process.exit(1);
}

const sql = neon(databaseUrl);

await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
await sql`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
)`;

const journal = JSON.parse(
  await readFile(path.resolve("drizzle/meta/_journal.json"), "utf8"),
);
const appliedRows = await sql`SELECT hash FROM drizzle.__drizzle_migrations`;
const applied = new Set(appliedRows.map((r) => r.hash));

for (const entry of journal.entries) {
  const file = path.resolve("drizzle", `${entry.tag}.sql`);
  const content = await readFile(file, "utf8");
  const hash = createHash("sha256").update(content).digest("hex");

  if (applied.has(hash)) {
    console.log(`✓ already applied: ${entry.tag}`);
    continue;
  }

  console.log(`→ applying: ${entry.tag}`);
  const statements = content
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (error) {
      if (DUPLICATE_ERROR_CODES.has(error?.code)) {
        console.log(`  (skipped, already exists: ${error.message})`);
        continue;
      }
      throw error;
    }
  }

  await sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${hash}, ${entry.when})`;
  console.log(`✓ applied: ${entry.tag}`);
}

console.log("Done.");
