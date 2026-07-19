import mongoose from "mongoose";
import { ensureSeeded } from "./seed";

const MONGODB_URI = process.env.MONGODB_URI || "";

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
}

const globalWithMongoose = global as typeof globalThis & { _mongoose?: Cached };

const cached: Cached = globalWithMongoose._mongoose || {
  conn: null,
  promise: null,
  seeded: false,
};
globalWithMongoose._mongoose = cached;

export async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  if (!cached.seeded) {
    cached.seeded = true;
    try {
      await ensureSeeded();
    } catch (e) {
      console.error("Seed error:", e);
    }
  }
  return cached.conn;
}
