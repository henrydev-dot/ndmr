import { NextResponse } from "next/server";
import type { Model } from "mongoose";
import { dbConnect } from "./db";
import { requireAdmin } from "./auth";

/**
 * Builds standard admin CRUD route handlers for a Mongoose model.
 * GET (list) + POST (create) for collection routes,
 * GET / PUT / DELETE for item routes.
 */
export function adminCollectionHandlers(model: Model<any>, sort: Record<string, 1 | -1> = { createdAt: -1 }) {
  return {
    async GET() {
      if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
      await dbConnect();
      const items = await model.find().sort(sort).lean();
      return NextResponse.json({ items });
    },
    async POST(req: Request) {
      if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
      await dbConnect();
      try {
        const body = await req.json();
        delete body._id;
        const item = await model.create(body);
        return NextResponse.json({ item }, { status: 201 });
      } catch (e: any) {
        return NextResponse.json({ error: e.message || "Kayıt oluşturulamadı." }, { status: 400 });
      }
    },
  };
}

export function adminItemHandlers(model: Model<any>) {
  return {
    async GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
      if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
      await dbConnect();
      const { id } = await ctx.params;
      const item = await model.findById(id).lean();
      if (!item) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
      return NextResponse.json({ item });
    },
    async PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
      if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
      await dbConnect();
      const { id } = await ctx.params;
      try {
        const body = await req.json();
        delete body._id;
        const item = await model.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
        if (!item) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
        return NextResponse.json({ item });
      } catch (e: any) {
        return NextResponse.json({ error: e.message || "Güncellenemedi." }, { status: 400 });
      }
    },
    async DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
      if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
      await dbConnect();
      const { id } = await ctx.params;
      await model.findByIdAndDelete(id);
      return NextResponse.json({ ok: true });
    },
  };
}
