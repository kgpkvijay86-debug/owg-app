const router = require("express").Router();
const Staff  = require("../models/Staff");
const { authenticate, managerOrAdmin } = require("../middleware/auth");

router.use(authenticate);

router.get("/", async (req, res) => {
  try { res.json(await Staff.find({ isActive: true }).sort({ name: 1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const s = await Staff.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json(s);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/", managerOrAdmin, async (req, res) => {
  try {
    const { name, empNo, designation, division, department } = req.body;
    if (!name || !empNo) return res.status(400).json({ error: "name and empNo required" });
    const s = await Staff.create({ name, empNo, designation, division, department });
    res.status(201).json(s);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Employee number already exists" });
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", managerOrAdmin, async (req, res) => {
  try {
    const s = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(s);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete("/:id", managerOrAdmin, async (req, res) => {
  try {
    await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Staff deactivated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
