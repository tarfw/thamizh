/**
 * Seed Tamil Nadu Legislative Assembly constituencies into InstantDB.
 *
 * Usage:
 *   $env:INSTANT_APP_ID = "..."
 *   $env:INSTANT_APP_ADMIN_TOKEN = "..."
 *   npx tsx scripts/seed-constituencies.ts
 *
 * Idempotent: upserts by the unique `code` field, so re-running is safe.
 */

import { init, id } from "@instantdb/admin";
import * as fs from "fs";
import * as path from "path";

type Row = {
  code: string;
  slug: string;
  nameEn: string;
  nameTa: string;
  district: string;
  number: number;
  reservation?: string;
};

async function main() {
  const appId = process.env.INSTANT_APP_ID || process.env.EXPO_PUBLIC_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;

  if (!appId) throw new Error("INSTANT_APP_ID (or EXPO_PUBLIC_INSTANT_APP_ID) is required");
  if (!adminToken) throw new Error("INSTANT_APP_ADMIN_TOKEN is required");

  const db = init({ appId, adminToken });

  const dataPath = path.resolve(__dirname, "..", "data", "tn-assembly-constituencies.json");
  const rows: Row[] = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  if (rows.length !== 234) {
    throw new Error(`Expected 234 rows, found ${rows.length}`);
  }

  const codes = rows.map((r) => r.code);
  const existing = await db.query({
    constituencies: { $: { where: { code: { $in: codes } } } },
  });

  const codeToId = new Map<string, string>();
  for (const c of existing.constituencies as { id: string; code: string }[]) {
    codeToId.set(c.code, c.id);
  }

  const steps = rows.map((r) => {
    const rowId = codeToId.get(r.code) ?? id();
    return db.tx.constituencies[rowId].update(r);
  });

  const CHUNK = 50;
  for (let i = 0; i < steps.length; i += CHUNK) {
    const chunk = steps.slice(i, i + CHUNK);
    const res = await db.transact(chunk);
    console.log(`tx ${i / CHUNK + 1}/${Math.ceil(steps.length / CHUNK)} — tx-id: ${res["tx-id"]}`);
  }

  console.log(`Seeded ${rows.length} constituencies.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
