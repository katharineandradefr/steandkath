import mongoose from "mongoose";

import { env } from "~/env";

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseConn?: typeof mongoose;
  mongoosePromise?: Promise<typeof mongoose>;
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (globalForMongoose.mongooseConn) {
    return globalForMongoose.mongooseConn;
  }
  globalForMongoose.mongoosePromise ??= mongoose.connect(env.MONGODB_URI);
  globalForMongoose.mongooseConn = await globalForMongoose.mongoosePromise;
  return globalForMongoose.mongooseConn;
}
