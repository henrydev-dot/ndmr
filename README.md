# Gökhan Işık — NDMR Antik Hipnoz Eğitimi Platformu

Kurumsal, karanlık temalı hipnoz eğitim platformu. Next.js (App Router) + MongoDB tek uygulama olarak çalışır: eğitim paketleri, öğrenme kartları, öğrenme oyunları, akademik arşiv kütüphanesi, psikolojik testler, randevu sistemi, ziyaretçi defteri ve tam kapsamlı admin paneli içerir.

## Özellikler

- **Eğitim paketleri** — modül/ders hiyerarşisi, müfredat akordiyonu, SSS, satın alan kullanıcıya açılan video dersler
- **Öğrenme kartları** — 3D çevrimli kartlar, "Biliyorum / Tekrar Et" ile basit aralıklı tekrar, deste ilerlemesi (localStorage)
- **Öğrenme oyunları** — eşleştirme, hafıza, zamanlı bilgi yarışması (skor tablosu), kelime tamamlama
- **Akademik kütüphane** — kategori/yıl/arama filtreleri, liste-grid görünümü, lightbox görsel arşivi
- **Psikolojik testler** — profil, yüzdelik dağılım (radar grafik) ve puan aralığı tabanlı üç hazır test; sosyal paylaşım; giriş yapan kullanıcıda sonuç geçmişi
- **Randevu sistemi** — 3 adımlı sihirbaz, ay takvimli ajanda, admin panelden müsaitlik tanımı, atomik çift-rezervasyon engeli (MongoDB partial unique index)
- **Ziyaretçi defteri** — rumuzlu notlar, yasaklı kelime filtresi, admin moderasyonu (onay/sabitleme/silme)
- **Admin paneli** — dashboard, tüm içerik CRUD'ları, randevu ve müsaitlik yönetimi, site ayarları, sosyal medya, iletişim mesajları
- **Auth** — JWT (httpOnly cookie) + bcrypt, user/admin rolleri, login rate limit
- **SEO** — SSR, sayfa bazlı meta, sitemap.xml, robots.txt

## Geliştirme

```bash
cp .env.example .env   # değerleri doldurun
npm install
npm run dev
```

İlk çalıştırmada (veritabanına ilk bağlantıda) `ADMIN_EMAIL` / `ADMIN_PASSWORD` ile admin kullanıcı ve örnek içerik (eğitimler, kart desteleri, oyun havuzu, kütüphane kayıtları, üç test) otomatik seed edilir.

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (giriş: `/admin/giris`)

## Docker

```bash
docker build -t hipnoz-egitim .
docker run -d -p 3000:3000 \
  -e MONGODB_URI="mongodb://..." \
  -e JWT_SECRET="uzun-rastgele-deger" \
  -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_PASSWORD="guclu-sifre" \
  -v uploads:/app/uploads \
  hipnoz-egitim
```

- Sağlık kontrolü: `GET /api/health`
- Yüklenen görsel/PDF'ler `/app/uploads` volume'unda tutulur ve `/api/files/:name` üzerinden servis edilir.

## Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
| --- | --- | --- |
| `MONGODB_URI` | Evet | MongoDB bağlantı adresi |
| `JWT_SECRET` | Evet | JWT imzalama anahtarı |
| `ADMIN_EMAIL` | İlk kurulum | Seed edilecek admin e-postası |
| `ADMIN_PASSWORD` | İlk kurulum | Seed edilecek admin şifresi |
| `PORT` | Hayır | Varsayılan 3000 |
| `SITE_URL` | Hayır | Sitemap/robots için tam adres |

## Teknoloji

Next.js 15 (App Router, standalone output) · TypeScript · Tailwind CSS (design token'lar CSS değişkenleriyle) · Mongoose · framer-motion · lucide-react · recharts
