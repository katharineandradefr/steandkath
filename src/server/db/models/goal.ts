import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import { GOAL_STATUSES } from "~/shared/goal";
import { PENDENCY_PROJECT_KEYS } from "~/shared/pendency";

const checklistItemSchema = new Schema(
  {
    /** itemId evita conflito com virtual `id` do Mongoose em subdocumentos. */
    itemId: { type: String, required: true },
    text: { type: String, required: true },
    checked: { type: Boolean, required: true, default: false },
  },
  { _id: false, id: false },
);

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
    assigneeId: { type: String, default: null },
    assigneeName: { type: String, default: null },
    assigneeAvatarUrl: { type: String, default: null },
    checklist: { type: [checklistItemSchema], default: [] },
    targetCount: { type: Number, default: null },
    doneCount: { type: Number, default: 0 },
    progressUnit: { type: String, default: null, maxlength: 40 },
  },
  { timestamps: true, id: false },
);

goalSchema.index({ areaKey: 1, startDate: 1, dueDate: 1 });

export type GoalDoc = InferSchemaType<typeof goalSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const GoalModel =
  (models.Goal as Model<GoalDoc> | undefined) ??
  model<GoalDoc>("Goal", goalSchema);
