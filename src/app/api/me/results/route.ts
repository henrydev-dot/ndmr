import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { TestResult } from "@/models";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ items: [] });
  await dbConnect();
  const items = await TestResult.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ items });
}
