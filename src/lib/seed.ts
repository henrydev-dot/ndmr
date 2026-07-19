import bcrypt from "bcryptjs";
import {
  User,
  Course,
  Availability,
  FlashcardDeck,
  GameItem,
  GameSetting,
  LibraryItem,
  Test,
  Settings,
} from "@/models";

export async function ensureSeeded() {
  await seedAdmin();
  await seedSettings();
  await seedAvailability();
  await seedCourses();
  await seedFlashcards();
  await seedGames();
  await seedLibrary();
  await seedTests();
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name: "Gökhan Işık",
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
  });
}

async function seedSettings() {
  const existing = await Settings.findOne({ key: "site" });
  if (existing) return;
  await Settings.create({
    key: "site",
    siteTitle: "Gökhan Işık | NDMR Antik Hipnoz Eğitimi",
    siteDescription:
      "NDMR Antik Hipnoz Eğitimi ve Bilinçaltı Değişimi metodolojisi. Eğitim programları, öğrenme araçları, akademik arşiv ve randevu sistemi.",
    heroTitleLine1: "Bilinçaltı",
    heroTitleLine2: "Değişiminin Sanatı",
    heroSubtitle: "NDMR Antik Hipnoz Eğitimi ile zihinsel dönüşümün kapılarını aralayın.",
    contact: {
      phone: "",
      email: "",
      address: "",
      whatsappNumber: "",
      whatsappTemplate: "Merhaba, NDMR Antik Hipnoz Eğitimi hakkında bilgi almak istiyorum.",
    },
    socials: [],
    moderationEnabled: true,
    bannedWords: ["spam", "reklam"],
  });
}

async function seedAvailability() {
  const existing = await Availability.findOne();
  if (existing) return;
  await Availability.create({
    weekdays: [1, 2, 3, 4, 5].map((weekday) => ({
      weekday,
      enabled: true,
      startTime: "10:00",
      endTime: "18:00",
    })),
    slotDurationMinutes: 60,
    exceptions: [],
  });
}

async function seedCourses() {
  if ((await Course.countDocuments()) > 0) return;
  await Course.create([
    {
      title: "Temel Hipnoz Eğitimi",
      slug: "temel-hipnoz-egitimi",
      description:
        "Hipnozun temel prensipleri, bilinçaltının çalışma mekanizmaları ve ilk telkin uygulamaları için başlangıç programı.",
      longDescription:
        "Bu program, hipnoz dünyasına adım atmak isteyenler için tasarlanmıştır. Bilinç ve bilinçaltı arasındaki ilişkiyi, trans hâlinin doğasını ve etik uygulama ilkelerini sistematik bir müfredatla öğrenirsiniz. Program sonunda temel indüksiyon tekniklerini güvenle uygulayabilecek seviyeye ulaşırsınız.",
      duration: "4 Hafta",
      price: 4900,
      order: 1,
      gains: [
        "Bilinç ve bilinçaltı dinamiklerini kavrama",
        "Temel indüksiyon ve derinleştirme teknikleri",
        "Telkin dili ve etik uygulama ilkeleri",
        "Öz-hipnoz pratiği",
      ],
      faq: [
        {
          question: "Bu eğitim için ön koşul var mı?",
          answer: "Hayır. Program, hiçbir ön bilgi gerektirmeden sıfırdan başlar.",
        },
        {
          question: "Eğitim sonunda sertifika veriliyor mu?",
          answer: "Programı tamamlayan katılımcılara dijital katılım sertifikası verilir.",
        },
      ],
      modules: [
        {
          title: "Hipnozun Temelleri",
          order: 1,
          lessons: [
            { title: "Hipnoz Nedir, Ne Değildir?", order: 1 },
            { title: "Bilinç ve Bilinçaltı", order: 2 },
          ],
        },
        {
          title: "İlk Uygulamalar",
          order: 2,
          lessons: [
            { title: "Temel İndüksiyon Teknikleri", order: 1 },
            { title: "Derinleştirme ve Uyandırma", order: 2 },
          ],
        },
      ],
    },
    {
      title: "İleri NDMR Teknikleri",
      slug: "ileri-ndmr-teknikleri",
      description:
        "Antik telkin geleneklerini modern bilinçaltı çalışmalarıyla birleştiren NDMR metodolojisinin derinlemesine uygulaması.",
      longDescription:
        "NDMR metodolojisinin çekirdek programıdır. Antik dönem telkin ritüellerinin yapısal analizi, modern nörobilim bulgularıyla harmanlanarak uygulamalı protokollere dönüştürülür. Katılımcılar, katmanlı bilinçaltı çalışması ve kalıcı değişim protokollerini uygulamalı olarak deneyimler.",
      duration: "8 Hafta",
      price: 9800,
      order: 2,
      gains: [
        "NDMR protokolünün tüm aşamaları",
        "Katmanlı bilinçaltı haritalama",
        "Antik telkin yapılarının modern uyarlaması",
        "Vaka süpervizyonu",
      ],
      faq: [
        {
          question: "Temel eğitimi almadan katılabilir miyim?",
          answer:
            "Temel Hipnoz Eğitimi veya eşdeğer bir eğitimin tamamlanmış olması önerilir.",
        },
      ],
      modules: [
        {
          title: "NDMR Metodolojisine Giriş",
          order: 1,
          lessons: [
            { title: "Antik Telkin Gelenekleri", order: 1 },
            { title: "NDMR Protokolünün Yapısı", order: 2 },
          ],
        },
        {
          title: "Uygulamalı Protokoller",
          order: 2,
          lessons: [
            { title: "Katman Haritalama", order: 1 },
            { title: "Değişim Protokolleri", order: 2 },
          ],
        },
      ],
    },
    {
      title: "Profesyonel Uygulayıcı Sertifikası",
      slug: "profesyonel-uygulayici-sertifikasi",
      description:
        "Profesyonel danışmanlık pratiği kurmak isteyenler için süpervizyonlu, sertifikalı uzmanlık programı.",
      longDescription:
        "Uzmanlık seviyesindeki bu program, NDMR metodolojisini profesyonel danışmanlık pratiğine taşımak isteyenler için tasarlanmıştır. Vaka yönetimi, seans yapılandırma, etik ve yasal çerçeve ile süpervizyon eşliğinde gerçek uygulama deneyimi içerir.",
      duration: "12 Hafta",
      price: 19500,
      order: 3,
      gains: [
        "Profesyonel seans yapılandırma",
        "Vaka yönetimi ve süpervizyon",
        "Etik ve yasal çerçeve",
        "Uygulayıcı sertifikası",
      ],
      faq: [
        {
          question: "Sertifika uluslararası geçerli mi?",
          answer:
            "Sertifika, NDMR metodolojisinin kurucusu tarafından verilen kurumsal bir uygulayıcı sertifikasıdır.",
        },
      ],
      modules: [
        {
          title: "Profesyonel Pratik",
          order: 1,
          lessons: [
            { title: "Seans Yapılandırma", order: 1 },
            { title: "Vaka Yönetimi", order: 2 },
          ],
        },
        {
          title: "Süpervizyon",
          order: 2,
          lessons: [
            { title: "Uygulama Süpervizyonu", order: 1 },
            { title: "Sertifikasyon Değerlendirmesi", order: 2 },
          ],
        },
      ],
    },
  ]);
}

async function seedFlashcards() {
  if ((await FlashcardDeck.countDocuments()) > 0) return;
  await FlashcardDeck.create([
    {
      title: "Hipnoz Terminolojisi",
      category: "Terminoloji",
      description: "Hipnoz alanının temel kavramları ve teknik terimleri.",
      order: 1,
      cards: [
        { front: "İndüksiyon", back: "Danışanı uyanıklık hâlinden trans hâline geçiren yapılandırılmış yönlendirme süreci." },
        { front: "Trans", back: "Dikkatin daraldığı, telkine açıklığın arttığı doğal bir bilinç hâli." },
        { front: "Telkin", back: "Bilinçaltına yöneltilen, davranış veya algı değişimi hedefleyen sözel ya da sözsüz mesaj." },
        { front: "Derinleştirme", back: "Trans hâlinin seviyesini artırmak için kullanılan teknikler bütünü." },
        { front: "Abreaksiyon", back: "Bastırılmış duyguların trans sırasında yoğun biçimde açığa çıkması." },
        { front: "Post-hipnotik Telkin", back: "Trans sona erdikten sonra etkisini gösteren telkin türü." },
        { front: "Katalepsi", back: "Trans sırasında bir kas grubunun istemsiz olarak sabitlenmesi durumu." },
        { front: "Rapport", back: "Uygulayıcı ile danışan arasında kurulan güven ve uyum ilişkisi." },
      ],
    },
    {
      title: "Bilinçaltı Prensipleri",
      category: "Prensipler",
      description: "Bilinçaltının çalışma biçimine dair temel ilkeler.",
      order: 2,
      cards: [
        { front: "Bilinçaltı gerçek ile hayali ayırt etmez", back: "Canlı biçimde imgelenen deneyimler, bilinçaltında gerçek deneyimlere benzer izler bırakır." },
        { front: "Tekrar ilkesi", back: "Düzenli tekrar edilen düşünce ve telkinler bilinçaltında kalıcı programlara dönüşür." },
        { front: "Duygu yükü ilkesi", back: "Güçlü duyguyla eşleşen mesajlar bilinçaltına daha hızlı ve derin yerleşir." },
        { front: "Olumsuz ifade körlüğü", back: "Bilinçaltı olumsuzluk ekini işlemez; telkinler daima olumlu biçimde kurulmalıdır." },
        { front: "Şimdiki zaman ilkesi", back: "Bilinçaltı için zaman şimdidir; telkinler şimdiki zaman kipinde verilmelidir." },
        { front: "Sembol dili", back: "Bilinçaltı, kelimelerden çok imgeler, semboller ve metaforlarla iletişim kurar." },
      ],
    },
    {
      title: "NDMR Teknikleri",
      category: "NDMR",
      description: "NDMR metodolojisine özgü kavram ve protokol adımları.",
      order: 3,
      cards: [
        { front: "Katman Haritalama", back: "Danışanın bilinçaltı yapılarını katmanlar hâlinde tanımlayan NDMR ön değerlendirme aşaması." },
        { front: "Antik Ritim", back: "Antik telkin geleneklerinden uyarlanan, indüksiyonda kullanılan ritmik konuşma örüntüsü." },
        { front: "Kök İz", back: "Mevcut davranış örüntüsünün bilinçaltındaki ilk kayıt noktası." },
        { front: "Dönüşüm Protokolü", back: "Kök izin yeniden çerçevelenerek yeni bir öğrenmeyle değiştirildiği NDMR çekirdek aşaması." },
        { front: "Mühürleme", back: "Yeni öğrenmenin kalıcılığını sağlamak için seans sonunda uygulanan pekiştirme adımı." },
      ],
    },
    {
      title: "Hipnoz Tarihçesi",
      category: "Tarihçe",
      description: "Antik dönemden modern kliniğe hipnozun yolculuğu.",
      order: 4,
      cards: [
        { front: "Uyku Tapınakları", back: "Antik Mısır ve Yunan'da telkinle şifa uygulamalarının yapıldığı merkezler." },
        { front: "Franz Anton Mesmer", back: "18. yüzyılda 'hayvansal manyetizma' kuramıyla modern hipnozun öncüsü sayılan hekim." },
        { front: "James Braid", back: "'Hipnoz' terimini bilimsel literatüre kazandıran 19. yüzyıl cerrahı." },
        { front: "Milton H. Erickson", back: "Dolaylı telkin ve metafor kullanımıyla modern klinik hipnozu dönüştüren psikiyatrist." },
        { front: "Nancy Okulu", back: "Hipnozu telkine dayalı psikolojik bir süreç olarak açıklayan 19. yüzyıl Fransız ekolü." },
      ],
    },
  ]);
}

async function seedGames() {
  for (const gameType of ["quiz", "matching", "memory", "word"]) {
    await GameSetting.updateOne(
      { gameType },
      { $setOnInsert: { gameType, isActive: true } },
      { upsert: true }
    );
  }
  if ((await GameItem.countDocuments()) > 0) return;

  const quiz = [
    { question: "'Hipnoz' terimini bilimsel literatüre kazandıran kişi kimdir?", options: ["Franz Anton Mesmer", "James Braid", "Sigmund Freud", "Milton Erickson"], correctIndex: 1 },
    { question: "Bilinçaltı hangi ifade biçimini işleyemez?", options: ["Şimdiki zaman", "Olumlu telkin", "Olumsuzluk eki", "Sembolik imge"], correctIndex: 2 },
    { question: "Trans hâlinin seviyesini artırma tekniğine ne ad verilir?", options: ["İndüksiyon", "Derinleştirme", "Mühürleme", "Rapport"], correctIndex: 1 },
    { question: "Uygulayıcı ile danışan arasındaki güven ilişkisine ne denir?", options: ["Katalepsi", "Abreaksiyon", "Rapport", "Regresyon"], correctIndex: 2 },
    { question: "NDMR metodolojisinde davranış örüntüsünün ilk kayıt noktasına ne ad verilir?", options: ["Kök İz", "Antik Ritim", "Katman", "Mühür"], correctIndex: 0 },
    { question: "Antik dönemde telkinle şifa uygulanan merkezler hangisidir?", options: ["Agoralar", "Uyku Tapınakları", "Odeonlar", "Gymnasiumlar"], correctIndex: 1 },
    { question: "Trans sona erdikten sonra etki gösteren telkin türü hangisidir?", options: ["Doğrudan telkin", "Post-hipnotik telkin", "Dolaylı telkin", "Öz telkin"], correctIndex: 1 },
    { question: "Dolaylı telkin ve metaforlarla modern klinik hipnozu dönüştüren isim kimdir?", options: ["James Braid", "Jean-Martin Charcot", "Milton H. Erickson", "Émile Coué"], correctIndex: 2 },
    { question: "Bilinçaltına mesajın derin yerleşmesini hızlandıran temel etken nedir?", options: ["Yüksek ses", "Duygu yükü", "Uzun cümleler", "Tekrarsız telkin"], correctIndex: 1 },
    { question: "Trans sırasında kas grubunun istemsiz sabitlenmesine ne denir?", options: ["Katalepsi", "Amnezi", "Anestezi", "Halüsinasyon"], correctIndex: 0 },
    { question: "Hipnozu telkine dayalı psikolojik süreç olarak açıklayan ekol hangisidir?", options: ["Salpêtrière Okulu", "Nancy Okulu", "Viyana Okulu", "Zürih Okulu"], correctIndex: 1 },
    { question: "Bilinçaltı için telkinler hangi zaman kipinde kurulmalıdır?", options: ["Geçmiş zaman", "Gelecek zaman", "Şimdiki zaman", "Geniş zaman olumsuz"], correctIndex: 2 },
  ].map((q) => ({ ...q, gameType: "quiz", category: "Genel" }));

  const matching = [
    { term: "İndüksiyon", definition: "Trans hâline geçiş süreci" },
    { term: "Telkin", definition: "Bilinçaltına yöneltilen değişim mesajı" },
    { term: "Rapport", definition: "Güven ve uyum ilişkisi" },
    { term: "Derinleştirme", definition: "Trans seviyesini artırma" },
    { term: "Kök İz", definition: "Örüntünün ilk bilinçaltı kaydı" },
    { term: "Mühürleme", definition: "Yeni öğrenmeyi pekiştirme adımı" },
    { term: "Abreaksiyon", definition: "Bastırılmış duygunun açığa çıkması" },
    { term: "Katalepsi", definition: "Kasların istemsiz sabitlenmesi" },
  ].map((p) => ({ ...p, gameType: "matching", category: "Terminoloji" }));

  const memory = [
    { term: "Trans" },
    { term: "Telkin" },
    { term: "NDMR" },
    { term: "Bilinçaltı" },
    { term: "Ritim" },
    { term: "İmge" },
    { term: "Sembol" },
    { term: "Dönüşüm" },
  ].map((p) => ({ ...p, gameType: "memory", category: "Semboller" }));

  const word = [
    { word: "HİPNOZ", hint: "Telkine açıklığın arttığı bilinç hâlini inceleyen alan" },
    { word: "TELKİN", hint: "Bilinçaltına yöneltilen değişim mesajı" },
    { word: "TRANS", hint: "Dikkatin daraldığı doğal bilinç hâli" },
    { word: "RAPPORT", hint: "Uygulayıcı ile danışan arasındaki uyum" },
    { word: "İNDÜKSİYON", hint: "Trans hâline geçirme süreci" },
    { word: "BİLİNÇALTI", hint: "Otomatik örüntülerin kayıtlı olduğu zihin katmanı" },
    { word: "METAFOR", hint: "Bilinçaltının anladığı dolaylı anlatım biçimi" },
    { word: "MESMER", hint: "Hayvansal manyetizma kuramının sahibi" },
  ].map((p) => ({ ...p, gameType: "word", category: "Kelimeler" }));

  await GameItem.create([...quiz, ...matching, ...memory, ...word]);
}

async function seedLibrary() {
  if ((await LibraryItem.countDocuments()) > 0) return;
  await LibraryItem.create([
    {
      title: "Antik Yunan Uyku Tapınaklarında Telkin Pratikleri",
      author: "Derleme",
      year: 2018,
      category: "Tarihçe",
      abstract:
        "Asklepion merkezlerinde uygulanan enkoimesis (tapınak uykusu) ritüellerinin, modern hipnotik indüksiyon yapılarıyla karşılaştırmalı incelemesi.",
    },
    {
      title: "Hipnotik Telkinin Nöral Bağıntıları: Bir fMRI Derlemesi",
      author: "Derleme",
      year: 2021,
      category: "Nöroloji",
      abstract:
        "Hipnotik trans sırasında varsayılan mod ağı ve dikkat ağlarındaki aktivite değişimlerini inceleyen görüntüleme çalışmalarının sistematik özeti.",
    },
    {
      title: "Klinik Hipnozun Kaygı Yönetimindeki Etkinliği",
      author: "Derleme",
      year: 2020,
      category: "Klinik",
      abstract:
        "Kaygı semptomlarının yönetiminde hipnoterapinin tamamlayıcı kullanımına dair randomize kontrollü çalışmaların meta-analitik değerlendirmesi.",
    },
    {
      title: "NDMR Metodolojisinin Kuramsal Temelleri",
      author: "Gökhan Işık",
      year: 2023,
      category: "NDMR",
      abstract:
        "Antik telkin geleneklerinin yapısal analizi ile modern bilinçaltı çalışmalarını birleştiren NDMR protokolünün kuramsal çerçevesi ve uygulama ilkeleri.",
    },
    {
      title: "Mesmer'den Braid'e: Modern Hipnozun Doğuşu",
      author: "Derleme",
      year: 2016,
      category: "Tarihçe",
      abstract:
        "18. ve 19. yüzyılda hayvansal manyetizma kuramından bilimsel hipnoz kavramına geçişin tarihsel dönüm noktaları.",
    },
    {
      title: "Telkine Yatkınlık Ölçekleri: Karşılaştırmalı Bir İnceleme",
      author: "Derleme",
      year: 2019,
      category: "Klinik",
      abstract:
        "Stanford ve Harvard hipnotik duyarlılık ölçeklerinin psikometrik özellikleri ve klinik kullanım alanlarının karşılaştırması.",
    },
  ]);
}

async function seedTests() {
  if ((await Test.countDocuments()) > 0) return;

  const mapScores = (obj: Record<string, number>) => obj;

  await Test.create([
    {
      title: "Bilinçaltı Haritan: Zihnin Hangi Katmanında Yaşıyorsun?",
      slug: "bilincalti-haritan",
      description:
        "10 soruluk bu keşif testi, zihinsel yaşantının ağırlıklı olarak hangi bilinçaltı katmanında geçtiğini ortaya koyar.",
      resultType: "profile",
      questions: [
        {
          text: "Sabah uyandığında zihnindeki ilk şey genellikle nedir?",
          options: [
            { text: "Günün planı ve yapılacaklar", scores: mapScores({ gozlemci: 2 }) },
            { text: "Gece gördüğüm rüyanın izleri", scores: mapScores({ derin: 2 }) },
            { text: "Yeni bir fikir veya merak ettiğim bir konu", scores: mapScores({ kasif: 2 }) },
            { text: "Kendimi bugün nasıl daha iyi hissettirebilirim sorusu", scores: mapScores({ donusturucu: 2 }) },
          ],
        },
        {
          text: "Bir sorunla karşılaştığında ilk tepkin hangisi olur?",
          options: [
            { text: "Geri çekilir, tüm resmi görmeye çalışırım", scores: mapScores({ gozlemci: 2 }) },
            { text: "Denenmemiş bir çözüm ararım", scores: mapScores({ kasif: 2 }) },
            { text: "Sorunun bendeki karşılığını değiştirmeye odaklanırım", scores: mapScores({ donusturucu: 2 }) },
            { text: "Sezgilerimin ne söylediğini dinlerim", scores: mapScores({ derin: 2 }) },
          ],
        },
        {
          text: "Rüyalarınla ilişkin nasıldır?",
          options: [
            { text: "Nadiren hatırlarım", scores: mapScores({ gozlemci: 2 }) },
            { text: "Renkli ve maceralıdır, ilham alırım", scores: mapScores({ kasif: 2 }) },
            { text: "Tekrarlayan temaları çözümlemeye çalışırım", scores: mapScores({ donusturucu: 2 }) },
            { text: "Canlı, detaylı ve bazen yönlendirilebilir", scores: mapScores({ derin: 2 }) },
          ],
        },
        {
          text: "Kalabalık bir ortamda kendini nasıl hissedersin?",
          options: [
            { text: "İzleyici koltuğunda; insanları gözlemlerim", scores: mapScores({ gozlemci: 2 }) },
            { text: "Enerjik; yeni insanlar keşfetmek isterim", scores: mapScores({ kasif: 2 }) },
            { text: "Ortamın duygusal tonunu dönüştürmeye çalışırım", scores: mapScores({ donusturucu: 2 }) },
            { text: "Ortamın görünmeyen akışını hissederim", scores: mapScores({ derin: 2 }) },
          ],
        },
        {
          text: "Bir alışkanlığını değiştirmek istediğinde ne yaparsın?",
          options: [
            { text: "Davranışımı kayıt altına alıp analiz ederim", scores: mapScores({ gozlemci: 2 }) },
            { text: "Tamamen yeni bir rutin denerim", scores: mapScores({ kasif: 2 }) },
            { text: "Alışkanlığın altındaki ihtiyacı bulup dönüştürürüm", scores: mapScores({ donusturucu: 2 }) },
            { text: "İmgeleme ve iç konuşma ile çalışırım", scores: mapScores({ derin: 2 }) },
          ],
        },
        {
          text: "Sana en çekici gelen kitap hangisi olurdu?",
          options: [
            { text: "İnsan davranışları üzerine bir araştırma", scores: mapScores({ gozlemci: 2 }) },
            { text: "Bilinmeyen bir kültüre yolculuk anlatısı", scores: mapScores({ kasif: 2 }) },
            { text: "Kişisel dönüşüm hikâyesi", scores: mapScores({ donusturucu: 2 }) },
            { text: "Rüyalar ve sembolizm üzerine bir inceleme", scores: mapScores({ derin: 2 }) },
          ],
        },
        {
          text: "Sessiz kaldığın anlarda zihnin ne yapar?",
          options: [
            { text: "Günü ve insanları analiz eder", scores: mapScores({ gozlemci: 2 }) },
            { text: "Yeni olasılıklar kurgular", scores: mapScores({ kasif: 2 }) },
            { text: "Kendimle ilgili fark ettiklerimi işler", scores: mapScores({ donusturucu: 2 }) },
            { text: "İmgeler ve hisler arasında gezinir", scores: mapScores({ derin: 2 }) },
          ],
        },
        {
          text: "Bir karar verirken en çok neye güvenirsin?",
          options: [
            { text: "Verilere ve gözlemlerime", scores: mapScores({ gozlemci: 2 }) },
            { text: "Deneme cesaretime", scores: mapScores({ kasif: 2 }) },
            { text: "İçsel değerlerime", scores: mapScores({ donusturucu: 2 }) },
            { text: "Açıklayamadığım ama güçlü iç hislerime", scores: mapScores({ derin: 2 }) },
          ],
        },
        {
          text: "Geçmişte seni etkileyen bir anıyla karşılaştığında ne olur?",
          options: [
            { text: "Mesafeli bakarım; olan olmuştur", scores: mapScores({ gozlemci: 2 }) },
            { text: "Ondan yeni bir yön çıkarırım", scores: mapScores({ kasif: 2 }) },
            { text: "Anının bugünkü etkisini yeniden yazarım", scores: mapScores({ donusturucu: 2 }) },
            { text: "Anının duygusunu bedenimde hissederim", scores: mapScores({ derin: 2 }) },
          ],
        },
        {
          text: "Sana göre zihin en çok neye benzer?",
          options: [
            { text: "Bir gözlem kulesine", scores: mapScores({ gozlemci: 2 }) },
            { text: "Haritasız bir okyanusa", scores: mapScores({ kasif: 2 }) },
            { text: "Sürekli yeniden inşa edilen bir yapıya", scores: mapScores({ donusturucu: 2 }) },
            { text: "Dibi görünmeyen durgun bir göle", scores: mapScores({ derin: 2 }) },
          ],
        },
      ],
      results: [
        {
          key: "gozlemci",
          title: "Gözlemci",
          description:
            "Zihninin üst katmanında, berrak bir gözlem noktasında yaşıyorsun. Analiz gücün yüksek; ancak bilinçaltının derin katmanları henüz keşfedilmeyi bekliyor.",
          recommendation:
            "Gözlem yeteneğini derinlik çalışmasıyla birleştirmek için Temel Hipnoz Eğitimi ideal bir başlangıç olabilir.",
          ctaCourseSlug: "temel-hipnoz-egitimi",
        },
        {
          key: "kasif",
          title: "Kaşif",
          description:
            "Zihninin sınır bölgelerinde dolaşan bir kâşifsin. Yeni deneyimlere açıklığın, bilinçaltı çalışmaları için güçlü bir kapı aralıyor.",
          recommendation:
            "Keşif enerjini sistematik bir yönteme dönüştürmek için Temel Hipnoz Eğitimi ile başlayabilirsin.",
          ctaCourseSlug: "temel-hipnoz-egitimi",
        },
        {
          key: "donusturucu",
          title: "Dönüştürücü",
          description:
            "Zihninin orta katmanlarında, değişimin mutfağında yaşıyorsun. Fark ettiğini dönüştürme isteğin, bilinçaltı çalışmalarının çekirdek motivasyonudur.",
          recommendation:
            "Dönüşüm pratiğini derinleştirmek için İleri NDMR Teknikleri programını inceleyebilirsin.",
          ctaCourseSlug: "ileri-ndmr-teknikleri",
        },
        {
          key: "derin",
          title: "Derin Dalgıç",
          description:
            "Zihninin derin katmanlarıyla doğal bir bağın var. İmgelem gücün ve sezgisel algın, ileri bilinçaltı çalışmaları için nadir bir potansiyel taşıyor.",
          recommendation:
            "Bu doğal yatkınlığı profesyonel bir beceriye dönüştürmek için İleri NDMR Teknikleri programı sana göre.",
          ctaCourseSlug: "ileri-ndmr-teknikleri",
        },
      ],
    },
    {
      title: "Bilinçaltı Kişilik Analizi: Kararlarını Gerçekten Kim Veriyor?",
      slug: "kisilik-analizi",
      description:
        "12 soruluk bu analiz, kararlarını yönlendiren dört iç sesin — mantık, sezgi, duygu ve alışkanlık — zihnindeki ağırlığını yüzdelik olarak gösterir.",
      resultType: "distribution",
      questions: [
        {
          text: "Büyük bir satın alma kararı öncesinde ne yaparsın?",
          options: [
            { text: "Fiyat ve özellik karşılaştırması yaparım", scores: mapScores({ mantik: 3 }) },
            { text: "İçime sinip sinmediğine bakarım", scores: mapScores({ sezgi: 3 }) },
            { text: "O anki hevesim belirleyicidir", scores: mapScores({ duygu: 3 }) },
            { text: "Hep aldığım markaya yönelirim", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Yeni bir insanla tanıştığında ilk değerlendirmen nasıl olur?",
          options: [
            { text: "Söylediklerinin tutarlılığına bakarım", scores: mapScores({ mantik: 3 }) },
            { text: "İlk saniyedeki hissime güvenirim", scores: mapScores({ sezgi: 3 }) },
            { text: "Bana hissettirdiği sıcaklığa göre", scores: mapScores({ duygu: 3 }) },
            { text: "Tanıdığım insan tiplerine benzetirim", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Yoğun bir günün sonunda kendini nasıl toparlarsın?",
          options: [
            { text: "Günü zihnimde maddeler hâlinde kapatırım", scores: mapScores({ mantik: 3 }) },
            { text: "Sessizlikte iç sesimi dinlerim", scores: mapScores({ sezgi: 3 }) },
            { text: "Sevdiğim biriyle konuşurum", scores: mapScores({ duygu: 3 }) },
            { text: "Her akşamki rutinimi uygularım", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Bir teklifi reddetmen gerektiğinde nasıl davranırsın?",
          options: [
            { text: "Gerekçelerimi net biçimde açıklarım", scores: mapScores({ mantik: 3 }) },
            { text: "Doğru zamanı hissederek söylerim", scores: mapScores({ sezgi: 3 }) },
            { text: "Karşımdakini kırmamaya odaklanırım", scores: mapScores({ duygu: 3 }) },
            { text: "Her zamanki kalıp cümlelerimi kullanırım", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Tatil planını nasıl yaparsın?",
          options: [
            { text: "Araştırır, karşılaştırır, optimize ederim", scores: mapScores({ mantik: 3 }) },
            { text: "Beni çeken yere kulak veririm", scores: mapScores({ sezgi: 3 }) },
            { text: "Hayalini kurduğum yere giderim", scores: mapScores({ duygu: 3 }) },
            { text: "Bildiğim, sevdiğim yere dönerim", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "İş yerinde beklenmedik bir kriz çıktığında ilk hamlen nedir?",
          options: [
            { text: "Sorunu parçalara ayırırım", scores: mapScores({ mantik: 3 }) },
            { text: "Neyin yanlış olduğunu içimde hissederim", scores: mapScores({ sezgi: 3 }) },
            { text: "Önce ekibin moralini korurum", scores: mapScores({ duygu: 3 }) },
            { text: "Daha önce işe yarayan çözümü uygularım", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Bir film ya da diziyi neye göre seçersin?",
          options: [
            { text: "Puanlara ve eleştirilere bakarım", scores: mapScores({ mantik: 3 }) },
            { text: "Afişine bakınca içimde uyanan hisse", scores: mapScores({ sezgi: 3 }) },
            { text: "O anki ruh hâlime", scores: mapScores({ duygu: 3 }) },
            { text: "Sevdiğim türün dışına pek çıkmam", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Biri sana hediye alacak olsa en çok neye sevinirsin?",
          options: [
            { text: "İhtiyacım olan işlevsel bir şeye", scores: mapScores({ mantik: 3 }) },
            { text: "Beni gerçekten 'görüldüğümü' hissettiren şeye", scores: mapScores({ sezgi: 3 }) },
            { text: "Duygusal anlamı olan bir şeye", scores: mapScores({ duygu: 3 }) },
            { text: "Koleksiyonuma eklenecek bir şeye", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Hayatında köklü bir değişiklik yapmadan önce...",
          options: [
            { text: "Artı-eksi listesi çıkarırım", scores: mapScores({ mantik: 3 }) },
            { text: "İçimdeki 'evet' sesini beklerim", scores: mapScores({ sezgi: 3 }) },
            { text: "Sevdiklerimin ne hissedeceğini düşünürüm", scores: mapScores({ duygu: 3 }) },
            { text: "Mevcut düzenimi bozacaksa ertelerim", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Tartışma anında seni en iyi tanımlayan hangisi?",
          options: [
            { text: "Kanıt ve tutarlılık ararım", scores: mapScores({ mantik: 3 }) },
            { text: "Söylenmeyeni sezerim", scores: mapScores({ sezgi: 3 }) },
            { text: "Ses tonlarından etkilenirim", scores: mapScores({ duygu: 3 }) },
            { text: "Hep aynı savunma biçimine dönerim", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Sabah rutinin bozulursa ne olur?",
          options: [
            { text: "Hızla yeni bir plan kurarım", scores: mapScores({ mantik: 3 }) },
            { text: "Güne uyum sağlayacak akışı hissederim", scores: mapScores({ sezgi: 3 }) },
            { text: "Günüm boyunca tedirgin hissederim", scores: mapScores({ duygu: 3 }) },
            { text: "Ciddi biçimde huzursuz olurum; rutin benim düzenim", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
        {
          text: "Sana göre 'doğru karar' nedir?",
          options: [
            { text: "Verilerle savunulabilen karar", scores: mapScores({ mantik: 3 }) },
            { text: "Zamanla doğruluğu içten hissedilen karar", scores: mapScores({ sezgi: 3 }) },
            { text: "Kalbimi rahatlatan karar", scores: mapScores({ duygu: 3 }) },
            { text: "Denenmiş ve güvenli olan karar", scores: mapScores({ aliskanlik: 3 }) },
          ],
        },
      ],
      results: [
        { key: "mantik", title: "Mantık", description: "Kararlarında analitik değerlendirme, veri ve tutarlılık arayışı öne çıkıyor." },
        { key: "sezgi", title: "Sezgi", description: "Kararlarında iç ses, örtük örüntü tanıma ve hissedilen doğruluk belirleyici." },
        { key: "duygu", title: "Duygu", description: "Kararlarında duygusal rezonans ve ilişkisel etkiler ağır basıyor." },
        { key: "aliskanlik", title: "Alışkanlık", description: "Kararlarında bilinçaltına yerleşmiş rutinler ve denenmiş güvenli yollar etkili." },
      ],
    },
    {
      title: "Telkine Ne Kadar Açıksın? Hipnotik Duyarlılık Testi",
      slug: "telkin-duyarliligi",
      description:
        "8 soruluk bu hızlı test, imgeleme gücün ve odaklanma biçimin üzerinden telkine açıklık seviyeni tahmin eder.",
      resultType: "range",
      questions: [
        {
          text: "Bir kitaba ya da filme daldığında çevrendekileri duymadığın olur mu?",
          options: [
            { text: "Neredeyse hiç", scores: mapScores({ total: 0 }) },
            { text: "Ara sıra", scores: mapScores({ total: 1 }) },
            { text: "Sık sık", scores: mapScores({ total: 2 }) },
            { text: "Çok sık; zaman kavramımı yitiririm", scores: mapScores({ total: 3 }) },
          ],
        },
        {
          text: "Gözlerini kapatıp bir limonu ısırdığını hayal et. Ağzında ekşilik hisseder misin?",
          options: [
            { text: "Hayır, hiçbir şey hissetmem", scores: mapScores({ total: 0 }) },
            { text: "Belli belirsiz", scores: mapScores({ total: 1 }) },
            { text: "Evet, hafifçe", scores: mapScores({ total: 2 }) },
            { text: "Evet, ağzım gerçekten sulanır", scores: mapScores({ total: 3 }) },
          ],
        },
        {
          text: "Müzik dinlerken bedeninin kendiliğinden ritme uyduğu olur mu?",
          options: [
            { text: "Hayır", scores: mapScores({ total: 0 }) },
            { text: "Nadiren", scores: mapScores({ total: 1 }) },
            { text: "Sıklıkla", scores: mapScores({ total: 2 }) },
            { text: "Neredeyse her zaman", scores: mapScores({ total: 3 }) },
          ],
        },
        {
          text: "Uzun bir yolculukta dalıp gidip yolun bir kısmını hatırlamadığın olur mu?",
          options: [
            { text: "Hiç olmadı", scores: mapScores({ total: 0 }) },
            { text: "Bir iki kez oldu", scores: mapScores({ total: 1 }) },
            { text: "Zaman zaman olur", scores: mapScores({ total: 2 }) },
            { text: "Sık sık olur", scores: mapScores({ total: 3 }) },
          ],
        },
        {
          text: "Birinin anlattığı bir anıyı zihninde film gibi canlandırabilir misin?",
          options: [
            { text: "Hayır, sadece kelimeleri duyarım", scores: mapScores({ total: 0 }) },
            { text: "Bulanık sahneler görürüm", scores: mapScores({ total: 1 }) },
            { text: "Oldukça net canlandırırım", scores: mapScores({ total: 2 }) },
            { text: "Renkleri ve sesleriyle yaşarım", scores: mapScores({ total: 3 }) },
          ],
        },
        {
          text: "Etkileyici bir konuşmacıyı dinlerken kendini akışa kaptırır mısın?",
          options: [
            { text: "Hayır, eleştirel dinlerim", scores: mapScores({ total: 0 }) },
            { text: "Kısmen", scores: mapScores({ total: 1 }) },
            { text: "Çoğunlukla", scores: mapScores({ total: 2 }) },
            { text: "Tamamen; zaman akıp gider", scores: mapScores({ total: 3 }) },
          ],
        },
        {
          text: "Rahatlama egzersizi yaparken bedeninde ağırlık ya da hafiflik hisseder misin?",
          options: [
            { text: "Hiç denemedim / hissetmem", scores: mapScores({ total: 0 }) },
            { text: "Çok hafif", scores: mapScores({ total: 1 }) },
            { text: "Belirgin şekilde", scores: mapScores({ total: 2 }) },
            { text: "Çok güçlü şekilde", scores: mapScores({ total: 3 }) },
          ],
        },
        {
          text: "Duygusal bir sahnede gözlerinin dolduğu olur mu?",
          options: [
            { text: "Neredeyse hiç", scores: mapScores({ total: 0 }) },
            { text: "Nadiren", scores: mapScores({ total: 1 }) },
            { text: "Bazen", scores: mapScores({ total: 2 }) },
            { text: "Sık sık", scores: mapScores({ total: 3 }) },
          ],
        },
      ],
      results: [
        {
          key: "dusuk",
          title: "Düşük Duyarlılık",
          description:
            "Analitik ve eleştirel zihin yapın baskın. Telkine açıklığın şu an düşük görünüyor; bu bir engel değil, farklı bir çalışma biçimi gerektiren bir başlangıç noktası.",
          recommendation:
            "Analitik zihinler için yapılandırılmış teknikler mevcuttur. Bir ön görüşme ile sana uygun yaklaşımı belirleyebiliriz.",
          minScore: 0,
          maxScore: 8,
        },
        {
          key: "orta",
          title: "Orta Duyarlılık",
          description:
            "İmgeleme gücün ve odaklanma esnekliğin dengeli. Düzenli pratikle telkine açıklığını belirgin şekilde derinleştirebilirsin.",
          recommendation:
            "Bu seviye, bilinçaltı çalışmaları için verimli bir zemindir. Randevu oluşturarak potansiyelini birlikte değerlendirebiliriz.",
          minScore: 9,
          maxScore: 16,
        },
        {
          key: "yuksek",
          title: "Yüksek Duyarlılık",
          description:
            "İmgelem gücün ve akışa geçme yeteneğin dikkat çekici düzeyde. Hipnotik çalışmalardan hızlı ve derin sonuç alma olasılığın yüksek.",
          recommendation:
            "Bu doğal yatkınlık profesyonel eşlikle güçlü bir dönüşüm aracına dönüşebilir. Bir seans randevusu oluşturmanı öneririz.",
          minScore: 17,
          maxScore: 24,
        },
      ],
    },
  ]);
}
