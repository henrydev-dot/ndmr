import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Test, TestResult } from "@/models";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await ctx.params;
  const test: any = await Test.findOne({ slug, isActive: true }).lean();
  if (!test) return NextResponse.json({ error: "Test bulunamadı." }, { status: 404 });

  const { answers } = await req.json();
  if (!Array.isArray(answers) || answers.length !== test.questions.length) {
    return NextResponse.json({ error: "Eksik veya geçersiz cevaplar." }, { status: 400 });
  }

  // Accumulate per-key scores from the selected options.
  const totals: Record<string, number> = {};
  for (let i = 0; i < test.questions.length; i++) {
    const q = test.questions[i];
    const idx = Number(answers[i]);
    const option = q.options[idx];
    if (!option) return NextResponse.json({ error: "Geçersiz cevap." }, { status: 400 });
    const scores: Record<string, number> =
      option.scores instanceof Map ? Object.fromEntries(option.scores) : option.scores || {};
    for (const [key, val] of Object.entries(scores)) {
      totals[key] = (totals[key] || 0) + Number(val);
    }
  }

  let result: any = null;
  let distribution: Record<string, number> | undefined;

  if (test.resultType === "range") {
    const total = totals.total || 0;
    result =
      test.results.find((r: any) => total >= (r.minScore ?? 0) && total <= (r.maxScore ?? Infinity)) ||
      test.results[test.results.length - 1];
    result = { ...result, totalScore: total };
  } else if (test.resultType === "distribution") {
    const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    distribution = {};
    for (const r of test.results) {
      distribution[r.key] = Math.round(((totals[r.key] || 0) / sum) * 100);
    }
    const topKey = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0];
    result = test.results.find((r: any) => r.key === topKey) || test.results[0];
  } else {
    const topKey = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];
    result = test.results.find((r: any) => r.key === topKey) || test.results[0];
  }

  const session = await getSession();
  if (session) {
    await TestResult.create({
      userId: session.userId,
      testSlug: test.slug,
      testTitle: test.title,
      resultKey: result?.key || "",
      resultTitle: result?.title || "",
      distribution: distribution || {},
    });
  }

  const resultLabels: Record<string, string> = {};
  for (const r of test.results) resultLabels[r.key] = r.title;

  return NextResponse.json({
    result: {
      key: result?.key,
      title: result?.title,
      description: result?.description,
      recommendation: result?.recommendation,
      ctaCourseSlug: result?.ctaCourseSlug,
      totalScore: result?.totalScore,
    },
    distribution,
    resultLabels,
  });
}
