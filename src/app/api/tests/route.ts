import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Test } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const items = await Test.find({ isActive: true })
    .select("title slug description questions resultType")
    .lean();
  const mapped = (items as any[]).map((t) => ({
    title: t.title,
    slug: t.slug,
    description: t.description,
    resultType: t.resultType,
    questionCount: t.questions?.length || 0,
  }));
  return NextResponse.json({ items: mapped });
}
