import { NextRequest, NextResponse } from "next/server";
import { getVerifiedToken } from "@/lib/adminAuth";
import { readMenuData, writeMenuData } from "@/lib/menuStorage";

/** GET /api/admin/menu – returns current menu data (requires auth) */
export async function GET(req: NextRequest) {
  if (!getVerifiedToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await readMenuData());
}

/** POST /api/admin/menu – replaces entire menu data (requires auth) */
export async function POST(req: NextRequest) {
  if (!getVerifiedToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid menu data" }, { status: 400 });
  }
  if (process.env.NODE_ENV === "production" && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not set. Go to Vercel → Storage → Create Blob store and connect it to this project." },
      { status: 500 }
    );
  }
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL_DEPLOY_HOOK_URL) {
    return NextResponse.json(
      { error: "VERCEL_DEPLOY_HOOK_URL is not set. Menu is saved to Blob, but public site will not update until a redeploy runs." },
      { status: 500 }
    );
  }
  try {
    await writeMenuData(body);

    // Trigger Vercel Deploy Hook to rebuild with updated menu
    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (hookUrl) {
      const deployRes = await fetch(hookUrl, { method: "POST" });
      if (!deployRes.ok) {
        const deployText = await deployRes.text().catch(() => "");
        throw new Error(
          `Deploy hook failed (${deployRes.status})${deployText ? `: ${deployText.slice(0, 200)}` : ""}`
        );
      }
    }
  } catch (err) {
    console.error("writeMenuData failed:", err);
    return NextResponse.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, message: "Menu updated. Changes will be live after rebuild (~1 min)." });
}
