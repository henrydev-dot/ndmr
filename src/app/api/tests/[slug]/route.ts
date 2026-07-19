import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Test } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await ctx.params;
  const test: any = await Test.findOne({ slug, isActive: true }).lean();
  if (!test) return NextResponse.json({ error: "Test bulunamadı." }, { status: 404 });
  // Strip scoring data before sending questions to the client.
  const questions = test.questions.map((q: any) => ({
    text: q.text,
    options: q.options.map((o: any) => ({ text: o.text })),
  }));
  return NextResponse.json({
    test: {
      title: test.title,
      slug: test.slug,
      description: test.description,
      resultType: test.resultType,
      questions,
    },
  });
}
