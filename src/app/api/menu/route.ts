import { NextResponse } from "next/server";
import { readMenuData } from "@/lib/menuStorage";

// Static content: menu is bundled at build time from data/menu.json
export const dynamic = "force-static";
export const revalidate = false; // Immutable until next deploy

/** Public menu endpoint used by the customer-facing page */
export async function GET() {
  const data = await readMenuData();
  return NextResponse.json(data, {
    headers: {
      // Cache indefinitely at edge and browser (content only changes on deploy)
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}