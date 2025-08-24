import mongoose from "mongoose";

const hearingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true, index: true },
    date:   { type: Date, required: true, index: true },
    venue:  String,
    notes:  String,
    outcome:String,
  },
  { timestamps: true }
);

hearingSchema.index({ userId: 1, caseId: 1, date: 1 });

export default mongoose.model("Hearing", hearingSchema);
