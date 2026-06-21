const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  code:      { type: String, required: true, unique: true, uppercase: true },
  timeFrom:  { type: String, required: true },
  timeTo:    { type: String, required: true },
  totalHrs:  { type: Number, default: 0 },
  otHrs:     { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Shift", shiftSchema);
