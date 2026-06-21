const router = require("express").Router();
const Shift  = require("../models/Shift");
const { authenticate, managerOrAdmin } = require("../middleware/auth");

router.use(authenticate);

function parseMin(t) {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1]), mn = parseInt(m[2]);
  const p = m[3].toUpperCase();
  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return h * 60 + mn;
}

function calcHours(from, to) {
  const s = parseMin(from), e = parseMin(to);
  if (s === null || e === null) return { totalHrs: 0, otHrs: 0 };
  const diff = (e - s + 1440) % 1440;
  const totalHrs = Math.round(diff / 60 * 10) / 10;
  const otHrs = Math.max(0, Math.round((totalHrs - 9) * 10) / 10);
  return { totalHrs, otHrs };
}

router.get("/", async (req, res) => {
  try { res.json(await Shift.find().sort({ code: 1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/", managerOrAdmin, async (req, res) => {
  try {
    const { code, timeFrom, timeTo } = req.body;
    if (!code || !timeFrom || !timeTo) return res.status(400).json({ error: "code, timeFrom, timeTo required" });
    const { totalHrs, otHrs } = calcHours(timeFrom, timeTo);
    const s = await Shift.create({ code: code.toUpperCase(), timeFrom, timeTo, totalHrs, otHrs });
    res.status(201).json(s);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Shift code exists" });
    res.status(500).json({ error: e.message });
  }
});

router.put("/:code", managerOrAdmin, async (req, res) => {
  try {
    const { timeFrom, timeTo } = req.body;
    const { totalHrs, otHrs } = calcHours(timeFrom, timeTo);
    const s = await Shift.findOneAndUpdate(
      { code: req.params.code.toUpperCase() },
      { timeFrom, timeTo, totalHrs, otHrs },
      { new: true }
    );
    res.json(s);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete("/:code", managerOrAdmin, async (req, res) => {
  try {
    await Shift.findOneAndDelete({ code: req.params.code.toUpperCase() });
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
