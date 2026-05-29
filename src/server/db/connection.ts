import mongoose from "mongoose";

import { env } from "~/env";

import { resolveMongoDbUri } from "~/server/db/resolve-mongodb-uri";

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseConn?: typeof mongoose;
  mongoosePromise?: Promise<typeof mongoose>;
  mongooseUri?: string;
};

/**
 * Conecta ao MongoDB (singleton em dev com hot reload).
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (globalForMongoose.mongooseConn) {
    return globalForMongoose.mongooseConn;
  }

  const uri = await resolveMongoDbUri(env.MONGODB_URI);

  if (globalForMongoose.mongooseUri !== uri) {
    globalForMongoose.mongoosePromise = undefined;
    globalForMongoose.mongooseConn = undefined;
    globalForMongoose.mongooseUri = uri;
  }

  globalForMongoose.mongoosePromise ??= mongoose
    .connect(uri)
    .catch((error: unknown) => {
      globalForMongoose.mongoosePromise = undefined;
      throw error;
    });

  globalForMongoose.mongooseConn = await globalForMongoose.mongoosePromise;
  return globalForMongoose.mongooseConn;
}
