import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { FlashcardDeck } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const items = await FlashcardDeck.find().sort({ order: 1 }).lean();
  return NextResponse.json({ items });
}
