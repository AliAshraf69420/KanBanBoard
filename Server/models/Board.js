import mongoose from "mongoose";

const BoardSchema = new mongoose.Schema(
  {
    lists: Object,
    cards: Object,
    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Board", BoardSchema);
