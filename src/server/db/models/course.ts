import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const courseSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, maxlength: 120 },
    bg: { type: String, required: true, maxlength: 20 },
    users: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CourseDoc = InferSchemaType<typeof courseSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const CourseModel =
  (models.Course as Model<CourseDoc> | undefined) ??
  model<CourseDoc>("Course", courseSchema);
