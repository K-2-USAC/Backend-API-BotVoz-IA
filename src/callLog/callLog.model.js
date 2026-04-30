import { Schema, model } from "mongoose";

/**
 * Schema that represents a full call session.
 * Each document = one phone call.
 * messages[] stores every turn (user speech + IA response).
 */
const callLogSchema = new Schema(
  {
    // Twilio's unique identifier for the call
    callSid: {
      type: String,
      required: [true, "CallSid is required"],
      unique: true,
      index: true,
    },

    // Phone number of the caller (Twilio's "From" field)
    callerPhone: {
      type: String,
      default: "unknown",
    },

    // Phone number dialed (Twilio's "To" field)
    calledPhone: {
      type: String,
      default: "unknown",
    },

    // Project this call was routed to (optional)
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    // Call status: active | completed | failed
    status: {
      type: String,
      enum: ["active", "completed", "failed"],
      default: "active",
    },

    // Array of conversation turns
    messages: [
      {
        // Who sent this message: "user" (speech) or "assistant" (IA)
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ISO timestamp when the call started (first webhook hit)
    startedAt: {
      type: Date,
      default: Date.now,
    },

    // ISO timestamp when the call ended (last webhook hit)
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

callLogSchema.methods.toJSON = function () {
  const { __v, _id, ...log } = this.toObject();
  log.uid = _id;
  return log;
};

export default model("CallLog", callLogSchema);
