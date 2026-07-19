import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { GameSetting } from "@/models";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await dbConnect();
  const items = await GameSetting.find().lean();
  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await dbConnect();
  const { gameType, isActive } = await req.json();
  const item = await GameSetting.findOneAndUpdate(
    { gameType },
    { isActive: Boolean(isActive) },
    { new: true, upsert: true }
  ).lean();
  return NextResponse.json({ item });
}
