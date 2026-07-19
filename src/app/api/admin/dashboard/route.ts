import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Appointment, GuestNote, ContactMessage, TestResult, Course, Test } from "@/models";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await dbConnect();
  const today = new Date().toISOString().slice(0, 10);
  const [
    pendingAppointments,
    todayAppointments,
    latestNotes,
    latestMessages,
    testCount,
    courseCount,
    activeTestCount,
    pendingNoteCount,
    unhandledMessageCount,
  ] = await Promise.all([
    Appointment.countDocuments({ status: "pending" }),
    Appointment.find({ date: today, status: { $in: ["pending", "approved"] } }).sort({ timeSlot: 1 }).lean(),
    GuestNote.find().sort({ createdAt: -1 }).limit(5).lean(),
    ContactMessage.find().sort({ createdAt: -1 }).limit(5).lean(),
    TestResult.countDocuments(),
    Course.countDocuments(),
    Test.countDocuments({ isActive: true }),
    GuestNote.countDocuments({ isApproved: false }),
    ContactMessage.countDocuments({ isHandled: false }),
  ]);
  return NextResponse.json({
    pendingAppointments,
    todayAppointments,
    latestNotes,
    latestMessages,
    testCount,
    courseCount,
    activeTestCount,
    pendingNoteCount,
    unhandledMessageCount,
  });
}
