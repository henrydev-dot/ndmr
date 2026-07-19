import { LibraryItem } from "@/models";
import { adminCollectionHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";
const handlers = adminCollectionHandlers(LibraryItem);
export const GET = handlers.GET;
export const POST = handlers.POST;
