import { LibraryItem } from "@/models";
import { adminItemHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";
const handlers = adminItemHandlers(LibraryItem);
export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
