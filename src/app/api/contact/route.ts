import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ContactMessage } from "@/models";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }
  await dbConnect();
  const { name, email, subject, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Ad, e-posta ve mesaj alanları zorunludur." }, { status: 400 });
  }
  await ContactMessage.create({
    name: String(name).slice(0, 100),
    email: String(email).slice(0, 200),
    subject: String(subject || "").slice(0, 200),
    message: String(message).slice(0, 3000),
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
