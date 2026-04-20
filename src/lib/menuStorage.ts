import { fullMenuData } from "@/lib/mainMenuData";

const BLOB_FILENAME = "kiki-menu.json";

// ── Vercel Blob helpers ───────────────────────────────────────────────────────

async function blobRead(): Promise<object | null> {
  try {
    const { get, list } = await import("@vercel/blob");
    const token = process.env.BLOB_READ_WRITE_TOKEN!;
    const { blobs } = await list({ prefix: BLOB_FILENAME, token });
    if (blobs.length === 0) return null;
    const latest = blobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];
    const result = await get(latest.pathname, {
      access: "private",
      token,
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

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
    const fs = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    const file = path.join(process.cwd(), "data", "menu.json");
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    // ignore
  }
  return null;
}

function localWrite(data: object): void {
  const fs = require("fs") as typeof import("fs");
  const path = require("path") as typeof import("path");
  const file = path.join(process.cwd(), "data", "menu.json");
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// ── Public API ────────────────────────────────────────────────────────────────

const hasBlobToken = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export async function readMenuData(): Promise<object> {
  if (hasBlobToken()) {
    const data = await blobRead();
    if (data) return data;
  } else {
    const data = localRead();
    if (data) return data;
  }
  return fullMenuData as object;
}

export async function writeMenuData(data: object): Promise<void> {
  if (hasBlobToken()) {
    await blobWrite(data);
  } else {
    localWrite(data);
  }
}