import { Course } from "@/models";
import { adminCollectionHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";
const handlers = adminCollectionHandlers(Course, { order: 1 });
export const GET = handlers.GET;
export const POST = handlers.POST;
