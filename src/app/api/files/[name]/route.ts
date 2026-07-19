import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const safe = path.basename(name);
  try {
    const filePath = path.join(process.cwd(), "uploads", safe);
    const data = await readFile(filePath);
    const type = MIME[path.extname(safe).toLowerCase()] || "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  }
}
