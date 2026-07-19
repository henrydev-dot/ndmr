import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import ContactForm from "@/components/ContactForm";
import SocialIcons from "@/components/SocialIcons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "İletişim",
  description: "Gökhan Işık ve NDMR Antik Hipnoz Eğitimi ile iletişime geçin.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { contact } = settings;
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="micro-label mb-4">İletişim</p>
      <h1 className="font-heading text-4xl font-light tracking-tight text-text-primary md:text-5xl">
        Bize Ulaşın
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">
        Eğitimler, seanslar veya kurumsal iş birlikleri hakkında sorularınız için formu doldurun
        ya da doğrudan iletişim kanallarımızı kullanın.
      </p>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ContactForm />

        <div className="space-y-6">
          <div className="card space-y-5 p-7">
            <p className="micro-label">İletişim Bilgileri</p>
            {contact.phone && (
              <p className="flex items-center gap-3 text-sm text-text-secondary">
                <Phone size={16} strokeWidth={1.5} className="text-accent-secondary" />
                {contact.phone}
              </p>
            )}
            {contact.email && (
              <p className="flex items-center gap-3 text-sm text-text-secondary">
                <Mail size={16} strokeWidth={1.5} className="text-accent-secondary" />
                {contact.email}
              </p>
            )}
            {contact.address && (
              <p className="flex items-start gap-3 text-sm leading-relaxed text-text-secondary">
                <MapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent-secondary" />
                {contact.address}
              </p>
            )}
            {!contact.phone && !contact.email && !contact.address && (
              <p className="text-sm text-text-muted">İletişim bilgileri yakında eklenecek.</p>
            )}
            <SocialIcons socials={settings.socials} />
          </div>

          {contact.whatsappNumber && (
            <a
              href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(contact.whatsappTemplate)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover flex items-center gap-4 p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border-accent text-accent-secondary">
                <MessageCircle size={22} strokeWidth={1.5} />
              </span>
              <span>
                <span className="block font-heading text-base font-medium text-text-primary">
                  WhatsApp ile yazın
                </span>
                <span className="mt-0.5 block text-xs text-text-secondary">
                  Sorularınız için hızlı iletişim kanalı
                </span>
              </span>
            </a>
          )}

          {contact.mapEmbedUrl && (
            <div className="card overflow-hidden">
              <iframe
                src={contact.mapEmbedUrl}
                className="h-64 w-full border-0"
                loading="lazy"
                title="Harita"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
