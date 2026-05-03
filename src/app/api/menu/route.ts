import { NextResponse } from "next/server";
import { readMenuData } from "@/lib/menuStorage";

/** Public menu endpoint used by the customer-facing page */
export async function GET() {
  const data = await readMenuData();
  return NextResponse.json(data, {
    headers: {
      // Cache at CDN for 24 hours; clients revalidate in background
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}