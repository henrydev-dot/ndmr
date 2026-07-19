import Link from "next/link";
import { ArrowRight, Clock, Layers } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { Course } from "@/models";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eğitim Paketleri",
  description:
    "NDMR Antik Hipnoz Eğitimi programları: temel hipnoz eğitiminden profesyonel uygulayıcı sertifikasına uzanan yolculuk.",
};

export default async function CoursesPage() {
  let courses: any[] = [];
  try {
    await dbConnect();
    courses = JSON.parse(
      JSON.stringify(
        await Course.find({ isPublished: true }).sort({ order: 1 }).lean()
      )
    );
  } catch {}

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <p className="micro-label mb-4">Eğitim Programları</p>
        <h1 className="font-heading text-4xl font-light tracking-tight text-text-primary md:text-5xl">
          Eğitim Paketleri
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">
          Her seviyeye uygun, sistematik olarak yapılandırılmış NDMR eğitim programları.
          Temellerden profesyonel uygulayıcılığa uzanan yolculuğunuzu seçin.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {courses.map((course, i) => {
          const moduleCount = course.modules?.length || 0;
          const lessonCount =
            course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
          return (
            <Reveal key={course.slug} delay={i * 0.1}>
              <div className="card card-hover flex h-full flex-col overflow-hidden">
                {course.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center border-b border-border-subtle bg-bg-secondary">
                    <Layers size={40} strokeWidth={1} className="text-accent/60" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} strokeWidth={1.5} /> {course.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Layers size={14} strokeWidth={1.5} /> {moduleCount} Modül
                      {lessonCount ? ` · ${lessonCount} Ders` : ""}
                    </span>
                  </div>
                  <h2 className="mt-4 font-heading text-xl font-medium text-text-primary">
                    {course.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
                    {course.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-5">
                    <p className="font-heading text-xl text-text-primary">
                      {Number(course.price).toLocaleString("tr-TR")} ₺
                    </p>
                    <Link
                      href={`/egitimler/${course.slug}`}
                      className="btn-secondary !px-4 !py-2 text-xs"
                    >
                      Detaylar <ArrowRight size={14} strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      {courses.length === 0 && (
        <p className="mt-14 text-text-muted">Eğitim programları yakında yayınlanacak.</p>
      )}
    </div>
  );
}
