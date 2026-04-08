import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

const savedTextSchema = new Schema(
  {
    content: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true },
);

type SavedTextDoc = InferSchemaType<typeof savedTextSchema> & {
  _id: Types.ObjectId;
};

export const SavedTextModel =
  (models.SavedText as Model<SavedTextDoc> | undefined) ??
  model<SavedTextDoc>("SavedText", savedTextSchema);
