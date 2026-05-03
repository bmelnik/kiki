import fs from "fs";
import path from "path";
import { fullMenuData } from "@/lib/mainMenuData";

const BLOB_FILENAME = "kiki-menu.json";

// ── Vercel Blob helpers ───────────────────────────────────────────────────────

async function blobWrite(data: object): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(BLOB_FILENAME, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// ── Local file fallback (dev only) ───────────────────────────────────────────

function localRead(): object | null {
  try {
    const file = path.join(process.cwd(), "data", "menu.json");
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    // ignore
  }
  return null;
}

function localWrite(data: object): void {
  const file = path.join(process.cwd(), "data", "menu.json");
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// ── Public API ────────────────────────────────────────────────────────────────
// Menu is now completely static at runtime (bundled at build time from data/menu.json).
// No Blob reads occur during request handling.

export async function readMenuData(): Promise<object> {
  // Read from local file (bundled at build time from Blob)
  const data = localRead();
  return data ?? (fullMenuData as object);
}

export async function writeMenuData(data: object): Promise<void> {
  // Write to Blob (triggered by admin save)
  // Build hook will pull this data on next deploy
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await blobWrite(data);
  }

  // In serverless production, /var/task is read-only. Keep local writes for dev only.
  if (process.env.NODE_ENV !== "production") {
    localWrite(data);
  }
}