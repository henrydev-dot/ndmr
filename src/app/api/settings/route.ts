import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Settings } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const item: any = await Settings.findOne({ key: "site" })
    .select("siteTitle siteDescription logoUrl heroTitleLine1 heroTitleLine2 heroSubtitle announcement contact socials")
    .lean();
  return NextResponse.json({ item });
}
