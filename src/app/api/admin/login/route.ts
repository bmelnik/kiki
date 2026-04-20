import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!adminPassword || !sessionSecret) {
    console.error("Admin auth is not configured. Missing ADMIN_PASSWORD or SESSION_SECRET.");
    return NextResponse.json(
      { error: "Admin auth is not configured on the server" },
      { status: 500 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = createSessionToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
