import mongoose, { type ClientSession } from "mongoose";
import "@/database";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

// In dev, Next.js hot reload can re-run code many times.
// We cache the connection to avoid opening many connections.
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// eslint-disable-next-line no-var
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function runInTransaction<T>(executor: (session: ClientSession) => Promise<T>): Promise<T> {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      return await executor(session);
    });

    return result as T;
  } catch (error) {
    // withTransaction() already aborts on thrown errors.
    // This is just a defensive fallback in case something throws
    // before the transaction is fully cleaned up.
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
}
