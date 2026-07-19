import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Appointment } from "@/models";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await dbConnect();
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const allowed: Record<string, unknown> = {};
    for (const key of ["status", "date", "timeSlot", "note"]) {
      if (body[key] !== undefined) allowed[key] = body[key];
    }
    const item = await Appointment.findByIdAndUpdate(id, allowed, { new: true, runValidators: true }).lean();
    if (!item) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: "Bu tarih ve saat için aktif bir randevu zaten var." }, { status: 409 });
    }
    return NextResponse.json({ error: e.message || "Güncellenemedi." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await dbConnect();
  const { id } = await ctx.params;
  await Appointment.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
