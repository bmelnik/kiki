import { NextRequest, NextResponse } from "next/server";
import { getVerifiedToken } from "@/lib/adminAuth";
import { fullMenuData } from "@/lib/mainMenuData";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "menu.json");

function readMenuData(): object {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch {
    // fall through to default
  }
  return fullMenuData as object;
}

function writeMenuData(data: object): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

/** GET /api/admin/menu – returns current menu data (requires auth) */
export async function GET(req: NextRequest) {
  if (!getVerifiedToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(readMenuData());
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
  writeMenuData(body);
  return NextResponse.json({ ok: true });
}
