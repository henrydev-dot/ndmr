import { dbConnect } from "./db";
import { Settings } from "@/models";

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  logoUrl: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  announcement: { text: string; isActive: boolean };
  contact: {
    phone: string;
    email: string;
    address: string;
    mapEmbedUrl: string;
    whatsappNumber: string;
    whatsappTemplate: string;
  };
  socials: { platform: string; url: string; isActive: boolean; order: number }[];
}

const DEFAULTS: SiteSettings = {
  siteTitle: "Gökhan Işık | NDMR Antik Hipnoz Eğitimi",
  siteDescription:
    "NDMR Antik Hipnoz Eğitimi ve Bilinçaltı Değişimi metodolojisi. Eğitim programları, öğrenme araçları, akademik arşiv ve randevu sistemi.",
  logoUrl: "",
  heroTitleLine1: "Bilinçaltı",
  heroTitleLine2: "Değişiminin Sanatı",
  heroSubtitle: "NDMR Antik Hipnoz Eğitimi ile zihinsel dönüşümün kapılarını aralayın.",
  announcement: { text: "", isActive: false },
  contact: {
    phone: "",
    email: "",
    address: "",
    mapEmbedUrl: "",
    whatsappNumber: "",
    whatsappTemplate: "Merhaba, NDMR Antik Hipnoz Eğitimi hakkında bilgi almak istiyorum.",
  },
  socials: [],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    await dbConnect();
    const doc: any = await Settings.findOne({ key: "site" }).lean();
    if (!doc) return DEFAULTS;
    return {
      ...DEFAULTS,
      ...doc,
      announcement: { ...DEFAULTS.announcement, ...(doc.announcement || {}) },
      contact: { ...DEFAULTS.contact, ...(doc.contact || {}) },
      socials: doc.socials || [],
    };
  } catch {
    return DEFAULTS;
  }
}
