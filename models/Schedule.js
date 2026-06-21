const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  staffId:   { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  date:      { type: Date, required: true },
  dayType:   { type: String, enum: ["NORMAL","OFFDAY","PUBLIC_HOLIDAY","ANNUAL_LEAVE","REPLACEMENT_OFF","UNPAID_LEAVE"], default: "NORMAL" },
  shiftCode: { type: String, default: null },
  otHrs:     { type: Number, default: 0 },
  remark:    { type: String, default: "" }
}, { timestamps: true });

scheduleSchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Schedule", scheduleSchema);
