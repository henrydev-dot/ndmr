import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { Test } from "@/models";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Psikolojik Testler",
  description:
    "Bilinçaltı haritanı çıkar, kişilik analizini yap, telkine açıklığını ölç. İnteraktif farkındalık testleri.",
};

export default async function TestsPage() {
  let tests: any[] = [];
  try {
    await dbConnect();
    const items = await Test.find({ isActive: true }).select("title slug description questions").lean();
    tests = JSON.parse(JSON.stringify(items));
  } catch {}

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <p className="micro-label mb-4">Bilinçaltını Keşfet</p>
        <h1 className="font-heading text-4xl font-light tracking-tight text-text-primary md:text-5xl">
          Psikolojik Testler
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">
          Eğlenceli ve düşündürücü testlerle zihninin işleyişine dair ipuçları yakala. Sonuçlar
          farkındalık amaçlıdır; klinik tanı niteliği taşımaz.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {tests.map((test, i) => (
          <Reveal key={test.slug} delay={i * 0.1}>
            <Link href={`/testler/${test.slug}`} className="card card-hover group flex h-full flex-col p-7">
              <ClipboardList
                size={32}
                strokeWidth={1.25}
                className="text-text-secondary transition-colors group-hover:text-accent"
              />
              <h2 className="mt-5 font-heading text-lg font-medium leading-snug text-text-primary">
                {test.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
                {test.description}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
                <span className="text-xs text-text-muted">{test.questions?.length || 0} soru</span>
                <span className="btn-ghost text-accent-secondary">
                  Teste Başla <ArrowRight size={15} strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      {tests.length === 0 && <p className="mt-14 text-text-muted">Şu anda aktif test bulunmuyor.</p>}
      <p className="mt-16 text-xs leading-relaxed text-text-muted">
        Bu testler eğlence ve farkındalık amaçlıdır; klinik tanı değildir. İçerikler tıbbi veya
        psikolojik tedavi yerine geçmez.
      </p>
    </div>
  );
}
