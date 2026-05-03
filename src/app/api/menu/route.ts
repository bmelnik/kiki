import { NextResponse } from "next/server";
import { readMenuData } from "@/lib/menuStorage";

// Static content: menu is bundled at build time from data/menu.json
export const dynamic = "force-static";
export const revalidate = false; // Rebuilt on deploy

/** Public menu endpoint used by the customer-facing page */
export async function GET() {
  const data = await readMenuData();
  return NextResponse.json(data, {
    headers: {
      // Force clients to revalidate so users see updates right after a successful rebuild.
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}