import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import {
  PENDENCY_PROJECT_KEYS,
  PENDENCY_RECURRENCES,
  PENDENCY_STATUSES,
  PENDENCY_URGENCIES,
} from "~/shared/pendency";

const attachmentSchema = new Schema(
  {
    id: { type: String, required: true },
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    provider: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    createdAt: { type: String, required: true },
  },
  { _id: false },
);

const linkSchema = new Schema(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    label: { type: String },
  },
  { _id: false },
);

const checklistItemSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    checked: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

const pendencySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    areaKey: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 500 },
    description: { type: String, default: null },
    descriptionMarkdown: { type: String, default: "" },
    projectKey: {
      type: String,
      required: true,
      enum: PENDENCY_PROJECT_KEYS,
    },
    status: {
      type: String,
      required: true,
      enum: PENDENCY_STATUSES,
      index: true,
    },
    urgency: {
      type: String,
      required: true,
      enum: PENDENCY_URGENCIES,
    },
    position: { type: Number, required: true, default: 0 },
    attachments: { type: [attachmentSchema], default: [] },
    links: { type: [linkSchema], default: [] },
    checklist: { type: [checklistItemSchema], default: [] },
    audience: {
      type: String,
      enum: ["design", "medical_team"],
      default: null,
    },
    professorResponsible: { type: String, default: null },
    directResponsibleId: { type: String, default: null },
    dueDate: { type: Date, default: null, index: true },
    recurrence: {
      type: String,
      enum: PENDENCY_RECURRENCES,
      default: "none",
    },
  },
  { timestamps: true },
);

pendencySchema.index({ areaKey: 1, status: 1, position: 1 });

export type PendencyDoc = InferSchemaType<typeof pendencySchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export const PendencyModel =
  (models.Pendency as Model<PendencyDoc> | undefined) ??
  model<PendencyDoc>("Pendency", pendencySchema);
