import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Settings } from "@/models";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await dbConnect();
  const item = await Settings.findOne({ key: "site" }).lean();
  return NextResponse.json({ item });
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await dbConnect();
  try {
    const body = await req.json();
    delete body._id;
    delete body.key;
    const item = await Settings.findOneAndUpdate({ key: "site" }, body, {
      new: true,
      upsert: true,
      runValidators: true,
    }).lean();
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Güncellenemedi." }, { status: 400 });
  }
}
