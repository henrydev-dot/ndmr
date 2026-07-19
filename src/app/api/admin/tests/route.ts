import { Test } from "@/models";
import { adminCollectionHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";
const handlers = adminCollectionHandlers(Test);
export const GET = handlers.GET;
export const POST = handlers.POST;
