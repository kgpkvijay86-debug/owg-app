const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  empNo:       { type: String, required: true, unique: true },
  designation: { type: String, default: "" },
  division:    { type: String, default: "" },
  department:  { type: String, default: "" },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
