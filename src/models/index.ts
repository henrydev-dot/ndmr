import mongoose, { Schema, model, models } from "mongoose";

/* ---------------------------------- User ---------------------------------- */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    purchasedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

/* --------------------------------- Course --------------------------------- */
const LessonSchema = new Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, default: "" },
  content: { type: String, default: "" },
  order: { type: Number, default: 0 },
});

const ModuleSchema = new Schema({
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  lessons: [LessonSchema],
});

const CourseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    longDescription: { type: String, default: "" },
    duration: { type: String, default: "" },
    price: { type: Number, default: 0 },
    coverImage: { type: String, default: "" },
    gains: [{ type: String }],
    faq: [{ question: String, answer: String }],
    modules: [ModuleSchema],
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ------------------------------- Appointment ------------------------------- */
const AppointmentSchema = new Schema(
  {
    serviceType: {
      type: String,
      enum: ["bireysel-seans", "egitim-danismanligi", "kurumsal-egitim"],
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    timeSlot: { type: String, required: true }, // HH:mm
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);
// Atomic double-booking guard: only one active (pending/approved) appointment per slot.
AppointmentSchema.index(
  { date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
  }
);

/* ------------------------------- Availability ------------------------------ */
const AvailabilitySchema = new Schema({
  weekdays: [
    {
      weekday: { type: Number, min: 0, max: 6 }, // 0 = Sunday
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: "10:00" },
      endTime: { type: String, default: "18:00" },
    },
  ],
  slotDurationMinutes: { type: Number, default: 60 },
  exceptions: [{ date: String, closed: { type: Boolean, default: true } }],
});

/* ------------------------------ Flashcard Deck ----------------------------- */
const FlashcardDeckSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: "Genel" },
    description: { type: String, default: "" },
    cards: [{ front: { type: String, required: true }, back: { type: String, required: true } }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ------------------------------- Game Content ------------------------------ */
const GameItemSchema = new Schema(
  {
    gameType: {
      type: String,
      enum: ["quiz", "matching", "memory", "word"],
      required: true,
    },
    question: { type: String, default: "" },
    options: [{ type: String }],
    correctIndex: { type: Number, default: 0 },
    term: { type: String, default: "" },
    definition: { type: String, default: "" },
    word: { type: String, default: "" },
    hint: { type: String, default: "" },
    category: { type: String, default: "Genel" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const GameSettingSchema = new Schema({
  gameType: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
});

/* ------------------------------- Library Item ------------------------------ */
const LibraryItemSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, default: "" },
    year: { type: Number },
    category: {
      type: String,
      enum: ["Tarihçe", "Klinik", "Nöroloji", "NDMR"],
      default: "Tarihçe",
    },
    abstract: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    externalUrl: { type: String, default: "" },
    images: [{ type: String }],
  },
  { timestamps: true }
);

/* ----------------------------------- Test ---------------------------------- */
const TestSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    resultType: {
      type: String,
      enum: ["profile", "range", "distribution"],
      default: "profile",
    },
    questions: [
      {
        text: { type: String, required: true },
        options: [
          {
            text: { type: String, required: true },
            // profile/distribution: map of resultKey -> points; range: { total: n }
            scores: { type: Map, of: Number, default: {} },
          },
        ],
      },
    ],
    results: [
      {
        key: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        recommendation: { type: String, default: "" },
        minScore: { type: Number },
        maxScore: { type: Number },
        ctaCourseSlug: { type: String, default: "" },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TestResultSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    testSlug: { type: String, required: true },
    testTitle: { type: String, default: "" },
    resultKey: { type: String, default: "" },
    resultTitle: { type: String, default: "" },
    distribution: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

/* -------------------------------- Guest Note ------------------------------- */
const GuestNoteSchema = new Schema(
  {
    nickname: { type: String, default: "Misafir" },
    message: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ------------------------------ Contact Message ----------------------------- */
const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    isHandled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* --------------------------------- Settings -------------------------------- */
const SettingsSchema = new Schema({
  key: { type: String, default: "site", unique: true },
  siteTitle: { type: String, default: "" },
  siteDescription: { type: String, default: "" },
  logoUrl: { type: String, default: "" },
  heroTitleLine1: { type: String, default: "" },
  heroTitleLine2: { type: String, default: "" },
  heroSubtitle: { type: String, default: "" },
  announcement: { text: { type: String, default: "" }, isActive: { type: Boolean, default: false } },
  contact: {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    whatsappTemplate: { type: String, default: "" },
  },
  socials: [
    {
      platform: {
        type: String,
        enum: ["instagram", "youtube", "x", "linkedin", "tiktok", "facebook"],
      },
      url: String,
      isActive: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
    },
  ],
  moderationEnabled: { type: Boolean, default: true },
  bannedWords: [{ type: String }],
});

function getModel<T>(name: string, schema: Schema): mongoose.Model<T> {
  return (models[name] as mongoose.Model<T>) || model<T>(name, schema);
}

export const User = getModel<any>("User", UserSchema);
export const Course = getModel<any>("Course", CourseSchema);
export const Appointment = getModel<any>("Appointment", AppointmentSchema);
export const Availability = getModel<any>("Availability", AvailabilitySchema);
export const FlashcardDeck = getModel<any>("FlashcardDeck", FlashcardDeckSchema);
export const GameItem = getModel<any>("GameItem", GameItemSchema);
export const GameSetting = getModel<any>("GameSetting", GameSettingSchema);
export const LibraryItem = getModel<any>("LibraryItem", LibraryItemSchema);
export const Test = getModel<any>("Test", TestSchema);
export const TestResult = getModel<any>("TestResult", TestResultSchema);
export const GuestNote = getModel<any>("GuestNote", GuestNoteSchema);
export const ContactMessage = getModel<any>("ContactMessage", ContactMessageSchema);
export const Settings = getModel<any>("Settings", SettingsSchema);
