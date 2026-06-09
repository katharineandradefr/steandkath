import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const userPreferencesSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    fontSize: {
      type: String,
      enum: ["small", "medium", "large", "extra_large"],
      default: "medium",
    },
    messageSound: {
      type: String,
      enum: ["none", "soft", "default", "alert"],
      default: "default",
    },
    colorMode: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    messageNotifications: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type UserPreferencesDoc = InferSchemaType<
  typeof userPreferencesSchema
> & {
  createdAt: Date;
  updatedAt: Date;
};

if (process.env.NODE_ENV !== "production" && models.UserPreferences) {
  delete models.UserPreferences;
}

export const UserPreferencesModel =
  (models.UserPreferences as Model<UserPreferencesDoc> | undefined) ??
  model<UserPreferencesDoc>("UserPreferences", userPreferencesSchema);
