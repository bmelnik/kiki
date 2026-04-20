import { NextResponse } from "next/server";
import { readMenuData } from "@/lib/menuStorage";

/** Public menu endpoint used by the customer-facing page */
export async function GET() {
  return NextResponse.json(await readMenuData());
}