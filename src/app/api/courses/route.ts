import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Course } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const items = await Course.find({ isPublished: true })
    .select("title slug description duration price coverImage gains modules order")
    .sort({ order: 1 })
    .lean();
  return NextResponse.json({ items });
}
