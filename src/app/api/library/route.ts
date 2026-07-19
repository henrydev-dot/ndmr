import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { LibraryItem } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const items = await LibraryItem.find().sort({ year: -1 }).lean();
  return NextResponse.json({ items });
}
