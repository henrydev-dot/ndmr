import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Clock, Layers, PlayCircle, Lock } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { Course, User } from "@/models";
import { getSession } from "@/lib/auth";
import Reveal from "@/components/Reveal";
import Accordion from "@/components/Accordion";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let course: any = null;
  let hasPurchased = false;
  try {
    await dbConnect();
    course = await Course.findOne({ slug, isPublished: true }).lean();
    if (course) {
      const session = await getSession();
      if (session) {
        const user: any = await User.findById(session.userId).select("purchasedCourses").lean();
        hasPurchased =
          session.role === "admin" ||
          Boolean(
            user?.purchasedCourses?.some((c: any) => c.toString() === course._id.toString())
          );
      }
      course = JSON.parse(JSON.stringify(course));
    }
  } catch {}
  if (!course) notFound();

  const modules = [...(course.modules || [])].sort((a: any, b: any) => a.order - b.order);
  const lessonCount = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);

  const curriculumItems = modules.map((m: any, i: number) => ({
    title: `${i + 1}. ${m.title}`,
    content: (
      <ul className="space-y-3">
        {[...(m.lessons || [])]
          .sort((a: any, b: any) => a.order - b.order)
          .map((lesson: any, li: number) => (
            <li key={li} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                {hasPurchased ? (
                  <PlayCircle size={16} strokeWidth={1.5} className="text-accent-secondary" />
                ) : (
                  <Lock size={14} strokeWidth={1.5} className="text-text-muted" />
                )}
                {lesson.title}
              </span>
              {hasPurchased && lesson.videoUrl && (
                <a
                  href={lesson.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-secondary hover:underline"
                >
                  Dersi İzle
                </a>
              )}
            </li>
          ))}
      </ul>
    ),
  }));

  const faqItems = (course.faq || []).map((f: any) => ({
    title: f.question,
    content: f.answer,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <p className="micro-label mb-4">Eğitim Programı</p>
        <h1 className="max-w-3xl font-heading text-4xl font-light tracking-tight text-text-primary md:text-5xl">
          {course.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2">
            <Clock size={16} strokeWidth={1.5} /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-2">
            <Layers size={16} strokeWidth={1.5} /> {modules.length} Modül · {lessonCount} Ders
          </span>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-14">
          <Reveal>
            <p className="leading-[1.8] text-text-secondary">
              {course.longDescription || course.description}
            </p>
          </Reveal>

          {course.gains?.length > 0 && (
            <Reveal>
              <p className="micro-label mb-5">Kazanımlar</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {course.gains.map((gain: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                    <Check size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" />
                    {gain}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {curriculumItems.length > 0 && (
            <Reveal>
              <p className="micro-label mb-5">Müfredat</p>
              <Accordion items={curriculumItems} />
              {!hasPurchased && (
                <p className="mt-4 text-xs text-text-muted">
                  Ders içerikleri, eğitimi satın alan katılımcılara açılır.
                </p>
              )}
            </Reveal>
          )}

          {faqItems.length > 0 && (
            <Reveal>
              <p className="micro-label mb-5">Sıkça Sorulan Sorular</p>
              <Accordion items={faqItems} />
            </Reveal>
          )}
        </div>

        <div>
          <Reveal delay={0.1}>
            <div className="card sticky top-28 p-7">
              <p className="micro-label">Program Ücreti</p>
              <p className="mt-3 font-heading text-4xl font-light text-text-primary">
                {Number(course.price).toLocaleString("tr-TR")} ₺
              </p>
              <div className="mt-6 space-y-3">
                {hasPurchased ? (
                  <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                    Bu eğitime erişiminiz var. Müfredattaki derslere göz atabilirsiniz.
                  </p>
                ) : (
                  <>
                    <Link href="/iletisim" className="btn-primary w-full justify-center">
                      Satın Al / Başvur <ArrowRight size={16} strokeWidth={1.5} />
                    </Link>
                    <Link href="/randevu" className="btn-secondary w-full justify-center">
                      Ön Görüşme Randevusu
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-text-muted">
                Başvuru sonrasında eğitim danışmanımız sizinle iletişime geçerek kayıt sürecini
                tamamlar.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
