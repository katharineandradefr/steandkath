import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

const drCofKnowledgeSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 10000 },
  },
  { timestamps: true },
);

type DrCofKnowledgeDoc = InferSchemaType<typeof drCofKnowledgeSchema> & {
  _id: Types.ObjectId;
};

export const DrCofKnowledgeModel =
  (models.DrCofKnowledge as Model<DrCofKnowledgeDoc> | undefined) ??
  model<DrCofKnowledgeDoc>("DrCofKnowledge", drCofKnowledgeSchema);
