import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import { PENDENCY_AREA_KEYS, PENDENCY_PROJECT_KEYS } from "~/shared/pendency";
import { USER_ROLES } from "~/shared/user";

const userSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, maxlength: 200 },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
    },
    email: { type: String, required: true, maxlength: 320 },
    phone: { type: String, default: null, maxlength: 30 },
    projects: {
      type: [String],
      required: true,
      enum: PENDENCY_PROJECT_KEYS,
      validate: {
        validator: (value: string[]) => value.length >= 1,
        message: "Selecione ao menos um projeto.",
      },
    },
    area: {
      type: String,
      enum: [...PENDENCY_AREA_KEYS, null],
      default: null,
    },
    photoBase64: { type: String, default: null },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const UserModel =
  (models.User as Model<UserDoc> | undefined) ??
  model<UserDoc>("User", userSchema);
