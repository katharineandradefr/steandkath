import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import { GOAL_STATUSES } from "~/shared/goal";
import { PENDENCY_PROJECT_KEYS } from "~/shared/pendency";

const goalSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    areaKey: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 500 },
    projectKey: {
      type: String,
      required: true,
      enum: PENDENCY_PROJECT_KEYS,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: GOAL_STATUSES,
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    dueDate: { type: Date, required: true, index: true },
    assigneeName: { type: String, default: null },
    assigneeAvatarUrl: { type: String, default: null },
  },
  { timestamps: true },
);

goalSchema.index({ areaKey: 1, startDate: 1, dueDate: 1 });

export type GoalDoc = InferSchemaType<typeof goalSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const GoalModel =
  (models.Goal as Model<GoalDoc> | undefined) ??
  model<GoalDoc>("Goal", goalSchema);
