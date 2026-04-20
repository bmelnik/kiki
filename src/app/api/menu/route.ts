import { NextResponse } from "next/server";
import { readMenuData } from "@/lib/menuStorage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Public menu endpoint used by the customer-facing page */
export async function GET() {
  const data = await readMenuData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}