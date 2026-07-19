import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Appointment } from "@/models";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (date) query.date = date;
  const items = await Appointment.find(query).sort({ date: 1, timeSlot: 1 }).lean();
  return NextResponse.json({ items });
}
