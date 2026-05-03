#!/usr/bin/env node
/**
 * Fetches the latest menu from Vercel Blob and writes it to data/menu.json
 * Runs during build to ensure the app always has the latest menu data
 */

const fs = require("fs");
const path = require("path");

async function fetchMenuFromBlob() {
  // Skip if no Blob token (dev environment)
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("⏭️  Skipping Blob fetch (no BLOB_READ_WRITE_TOKEN)");
    return;
  }

  try {
    const { list, get } = await import("@vercel/blob");
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const BLOB_FILENAME = "kiki-menu.json";

    console.log("📦 Fetching latest menu from Vercel Blob...");

    // List blobs to find the latest
    const { blobs } = await list({ prefix: BLOB_FILENAME, token });
    if (blobs.length === 0) {
      console.log("⚠️  No menu found in Blob, skipping");
      return;
    }

    // Get the most recent blob
    const latest = blobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    console.log(`📥 Fetching ${latest.pathname}...`);

    const result = await get(latest.pathname, {
      access: "private",
      token,
      useCache: false,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      console.error("❌ Failed to fetch from Blob");
      return;
    }

    const text = await new Response(result.stream).text();
    const data = JSON.parse(text);

    // Write to local file
    const file = path.join(process.cwd(), "data", "menu.json");
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");

    console.log("✅ Menu updated from Blob → data/menu.json");
  } catch (error) {
    console.error("❌ Error fetching menu from Blob:", error);
    process.exit(1);
  }
}

fetchMenuFromBlob();
