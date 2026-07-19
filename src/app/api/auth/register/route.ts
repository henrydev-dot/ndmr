import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models";
import { signToken, authCookieOptions } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!rateLimit(`register:${clientIp(req)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Şifre en az 8 karakter olmalıdır." }, { status: 400 });
    }
    await dbConnect();
    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).slice(0, 100),
      email: String(email).toLowerCase(),
      passwordHash,
      role: "user",
    });
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: "user",
    });
    const res = NextResponse.json({ ok: true, user: { name: user.name, email: user.email, role: user.role } });
    res.cookies.set("token", token, authCookieOptions());
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kayıt sırasında bir hata oluştu." }, { status: 500 });
  }
}
