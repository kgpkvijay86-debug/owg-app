require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
const path     = require("path");

const app = express();

// ── Middleware ──
app.use(cors({ origin: "*" }));
app.use(express.json());

// ── Serve frontend HTML ──
app.use(express.static(path.join(__dirname, "public")));

// ── Routes ──
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/staff",    require("./routes/staff"));
app.use("/api/shifts",   require("./routes/shifts"));
app.use("/api/schedule", require("./routes/schedule"));
app.use("/api/ot",       require("./routes/ot"));

// ── Health check ──
app.get("/api", (req, res) => res.json({ status: "OWG Backend running", version: "2.0.0" }));

// ── SPA fallback — serve index.html for all other routes ──
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server error", message: err.message });
});

// ── Connect MongoDB + Start ──
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected!");
    app.listen(PORT, () => console.log(`✅ OWG Backend running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
