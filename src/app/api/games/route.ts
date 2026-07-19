import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { GameItem, GameSetting } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const gameType = searchParams.get("type");
  if (gameType) {
    const setting = await GameSetting.findOne({ gameType }).lean();
    if (setting && !(setting as any).isActive) {
      return NextResponse.json({ items: [], active: false });
    }
    const items = await GameItem.find({ gameType, isActive: true }).lean();
    return NextResponse.json({ items, active: true });
  }
  const settings = await GameSetting.find().lean();
  return NextResponse.json({ settings });
}
