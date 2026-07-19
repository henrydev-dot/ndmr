import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Appointment, Availability } from "@/models";

export const dynamic = "force-dynamic";

function generateSlots(start: string, end: string, durationMin: number): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const slots: string[] = [];
  let minutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  while (minutes + durationMin <= endMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    minutes += durationMin;
  }
  return slots;
}

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // YYYY-MM-DD
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
  }
  const availability: any = await Availability.findOne().lean();
  if (!availability) return NextResponse.json({ slots: [], booked: [] });

  const exception = (availability.exceptions || []).find((e: any) => e.date === date && e.closed);
  if (exception) return NextResponse.json({ slots: [], booked: [], closed: true });

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const dayConfig = (availability.weekdays || []).find((w: any) => w.weekday === weekday);
  if (!dayConfig || !dayConfig.enabled) {
    return NextResponse.json({ slots: [], booked: [], closed: true });
  }

  const slots = generateSlots(
    dayConfig.startTime || "10:00",
    dayConfig.endTime || "18:00",
    availability.slotDurationMinutes || 60
  );
  const activeAppointments = await Appointment.find({
    date,
    status: { $in: ["pending", "approved"] },
  })
    .select("timeSlot")
    .lean();
  const booked = (activeAppointments as any[]).map((a) => a.timeSlot);
  return NextResponse.json({ slots, booked });
}
