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
  try {
    await writeMenuData(body);
  } catch {
    return NextResponse.json(
      {
        error:
          "Failed to persist menu changes on server storage. Configure writable persistent storage for production.",
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
