import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  let payload: { role?: string } | null = null;
  if (token) {
    try {
      payload = (await jwtVerify(token, secretKey)).payload as { role?: string };
    } catch {
      payload = null;
    }
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/giris") {
      if (payload?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }
    if (payload?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/giris", req.url));
    }
  }

  if (pathname.startsWith("/hesabim") && !payload) {
    return NextResponse.redirect(new URL("/giris", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/hesabim/:path*", "/hesabim"],
};
