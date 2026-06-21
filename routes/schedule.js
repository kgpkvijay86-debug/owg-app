const router   = require("express").Router();
const Schedule = require("../models/Schedule");
const { authenticate, managerOrAdmin } = require("../middleware/auth");

router.use(authenticate);

// GET /api/schedule?month=6&year=2025
router.get("/", async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: "month and year required" });
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end   = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    const data  = await Schedule.find({ date: { $gte: start, $lte: end } })
      .populate("staffId", "name empNo designation")
      .sort({ staffId: 1, date: 1 });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/schedule/bulk
router.post("/bulk", managerOrAdmin, async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries) || !entries.length)
      return res.status(400).json({ error: "entries array required" });

    const ops = entries.map(({ staffId, date, dayType, shiftCode, otHrs, remark }) => ({
      updateOne: {
        filter: { staffId, date: new Date(date) },
        update: { $set: { dayType: dayType || "NORMAL", shiftCode: shiftCode || null, otHrs: otHrs || 0, remark: remark || "" } },
        upsert: true
      }
    }));
    await Schedule.bulkWrite(ops);
    res.json({ saved: entries.length, message: "Schedule saved" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
