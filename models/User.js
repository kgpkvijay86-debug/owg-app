const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  name:      { type: String, required: true },
  role:      { type: String, enum: ["ADMIN","MANAGER","STAFF"], default: "STAFF" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
