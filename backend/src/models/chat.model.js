import mongoose from "mongoose";

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

chatSchema.path("participants").validate(function (value) {
  return Array.isArray(value) && value.length >= 2;
}, "A chat must have at least 2 participants.");

chatSchema.path("participants").validate(function (value) {
  if (!Array.isArray(value)) return false;
  const ids = value.map((id) => id.toString());
  return ids.length === new Set(ids).size;
}, "Participants must be unique.");

chatSchema.index({ participants: 1 });

export const Chat = mongoose.model("Chat", chatSchema);