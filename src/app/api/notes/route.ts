import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { GuestNote, Settings } from "@/models";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const items = await GuestNote.find({ isApproved: true })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(100)
    .select("nickname message isPinned createdAt")
    .lean();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!rateLimit(`note:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Çok fazla mesaj gönderdiniz. Lütfen biraz bekleyin." }, { status: 429 });
  }
  await dbConnect();
  const { nickname, message } = await req.json();
  const text = String(message || "").trim();
  if (!text || text.length < 2) {
    return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
  }
  if (text.length > 500) {
    return NextResponse.json({ error: "Mesaj 500 karakteri aşamaz." }, { status: 400 });
  }
  const settings: any = await Settings.findOne({ key: "site" }).lean();
  const banned: string[] = settings?.bannedWords || [];
  const lower = text.toLowerCase();
  if (banned.some((w) => w && lower.includes(w.toLowerCase()))) {
    return NextResponse.json({ error: "Mesajınız uygunsuz içerik filtresine takıldı." }, { status: 400 });
  }
  const moderation = settings?.moderationEnabled !== false;
  const note = await GuestNote.create({
    nickname: String(nickname || "Misafir").trim().slice(0, 40) || "Misafir",
    message: text,
    isApproved: !moderation,
  });
  return NextResponse.json(
    { item: note, pendingModeration: moderation },
    { status: 201 }
  );
}
