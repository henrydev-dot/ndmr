import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models";
import { signToken, authCookieOptions } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
    }
    await dbConnect();
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const res = NextResponse.json({ ok: true, user: { name: user.name, email: user.email, role: user.role } });
    res.cookies.set("token", token, authCookieOptions());
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Giriş sırasında bir hata oluştu." }, { status: 500 });
  }
}
