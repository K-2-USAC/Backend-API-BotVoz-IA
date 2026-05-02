import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    context: {
      type: String,
      default: "",
    },
    voiceTone: {
      type: String,
      enum: ["Formal", "Amigable", "Profesional", "Casual", "Persuasivo"],
      default: "Profesional",
    },
    targetAudience: {
      type: String,
      default: "General",
    },
    language: {
      type: String,
      default: "es-ES",
    },
    businessHours: {
      type: String,
      default: "",
    },
    knowledgeBase: [
      {
        type: String,
      },
    ],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    agentId: {
      type: String,
      required: [true, "Agent ID is required"],
    },
    status: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["Restaurante", "Hotel", "Tienda", "Otro"],
      default: "Restaurante",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

projectSchema.methods.toJSON = function () {
  const { __v, _id, ...project } = this.toObject();
  project.uid = _id;
  return project;
};

export default model("Project", projectSchema);
