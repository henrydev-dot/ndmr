import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Appointment } from "@/models";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SERVICES = ["bireysel-seans", "egitim-danismanligi", "kurumsal-egitim"];

export async function POST(req: Request) {
  if (!rateLimit(`appointment:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }
  await dbConnect();
  const body = await req.json();
  const { serviceType, date, timeSlot, customerName, customerEmail, customerPhone, note } = body;

  if (!SERVICES.includes(serviceType)) {
    return NextResponse.json({ error: "Geçersiz hizmet türü." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !/^\d{2}:\d{2}$/.test(String(timeSlot))) {
    return NextResponse.json({ error: "Geçersiz tarih veya saat." }, { status: 400 });
  }
  if (!customerName || !customerEmail || !customerPhone) {
    return NextResponse.json({ error: "İletişim bilgileri zorunludur." }, { status: 400 });
  }
  if (new Date(`${date}T23:59:59`) < new Date()) {
    return NextResponse.json({ error: "Geçmiş bir tarihe randevu oluşturulamaz." }, { status: 400 });
  }

  try {
    // The partial unique index on (date, timeSlot) makes this atomic:
    // a concurrent insert for the same active slot throws E11000.
    const appointment = await Appointment.create({
      serviceType,
      date,
      timeSlot,
      customerName: String(customerName).slice(0, 100),
      customerEmail: String(customerEmail).slice(0, 200),
      customerPhone: String(customerPhone).slice(0, 30),
      note: String(note || "").slice(0, 1000),
    });
    return NextResponse.json({ item: appointment }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json(
        { error: "Bu saat az önce dolduruldu. Lütfen başka bir saat seçin." },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Randevu oluşturulamadı." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ items: [] });
  await dbConnect();
  const items = await Appointment.find({ customerEmail: session.email })
    .sort({ date: -1, timeSlot: -1 })
    .lean();
  return NextResponse.json({ items });
}
