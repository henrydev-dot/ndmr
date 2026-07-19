import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);
const MAX_SIZE = 15 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Desteklenmeyen dosya türü." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Dosya boyutu 15MB sınırını aşıyor." }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".bin";
  const name = `${crypto.randomBytes(12).toString("hex")}${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, name), buffer);
  return NextResponse.json({ url: `/api/files/${name}` }, { status: 201 });
}
