const router   = require("express").Router();
const XLSX     = require("xlsx");
const Schedule = require("../models/Schedule");
const Staff    = require("../models/Staff");
const Shift    = require("../models/Shift");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

function pad2(n) { return String(n).padStart(2, "0"); }
function fmtDate(d) {
  const dt = new Date(d);
  return `${pad2(dt.getDate())}/${pad2(dt.getMonth()+1)}/${dt.getFullYear()}`;
}
function timeAdd(start, hrs) {
  const m = start.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return "";
  let h = parseInt(m[1]), mn = parseInt(m[2]);
  const p = m[3].toUpperCase();
  if (p==="PM"&&h!==12) h+=12; if (p==="AM"&&h===12) h=0;
  const tot = h*60+mn+Math.round(hrs*60);
  let nh=Math.floor(tot/60)%24, nm=tot%60;
  const np=nh>=12?"PM":"AM";
  if(nh>12)nh-=12; if(nh===0)nh=12;
  return nh+":"+String(nm).padStart(2,"0")+" "+np;
}

const NWH = {
  OFFDAY:          "OFFDAY",
  PUBLIC_HOLIDAY:  "PUBLIC HOLIDAY",
  ANNUAL_LEAVE:    "ANNUAL LEAVE",
  REPLACEMENT_OFF: "REPLACEMENT OFF DAY",
  UNPAID_LEAVE:    "UNPAID LEAVE"
};

// GET /api/ot/summary?month=6&year=2025
router.get("/summary", async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(parseInt(year), parseInt(month)-1, 1);
    const end   = new Date(parseInt(year), parseInt(month), 0, 23,59,59);
    const data  = await Schedule.find({ date: { $gte: start, $lte: end } })
      .populate("staffId", "name empNo");
    // Group by staff
    const map = {};
    for (const row of data) {
      const sid = row.staffId._id.toString();
      if (!map[sid]) map[sid] = { staff: row.staffId, totalOT: 0, entries: [] };
      map[sid].totalOT += row.otHrs || 0;
      map[sid].entries.push({ date: fmtDate(row.date), dayType: row.dayType, shiftCode: row.shiftCode, otHrs: row.otHrs });
    }
    res.json(Object.values(map));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ot/export
router.post("/export", async (req, res) => {
  try {
    const { staffIds, month, year, preparedBy } = req.body;
    if (!staffIds?.length || !month || !year)
      return res.status(400).json({ error: "staffIds, month, year required" });

    const start = new Date(parseInt(year), parseInt(month)-1, 1);
    const end   = new Date(parseInt(year), parseInt(month), 0);
    const dim   = end.getDate();

    // Load all shifts
    const shiftsArr = await Shift.find();
    const shiftsMap = {};
    shiftsArr.forEach(s => shiftsMap[s.code] = s);

    const wb = XLSX.utils.book_new();

    for (const staffId of staffIds) {
      const staffDoc = await Staff.findById(staffId);
      if (!staffDoc) continue;

      const schedules = await Schedule.find({
        staffId, date: { $gte: start, $lte: end }
      }).sort({ date: 1 });

      const schedMap = {};
      schedules.forEach(s => { schedMap[new Date(s.date).getDate()] = s; });

      const rows = [];
      let total = 0;

      for (let d = 1; d <= dim; d++) {
        const dt      = new Date(parseInt(year), parseInt(month)-1, d);
        const dow     = dt.getDay();
        const dateStr = fmtDate(dt);
        const sched   = schedMap[d];
        let nwhFrom="", nwhTo="", otFrom="", otTo="", otHrs=0, pubHol="";

        if (sched) {
          const label = NWH[sched.dayType];
          if (label) {
            nwhFrom = label; nwhTo = label;
            if (sched.dayType === "PUBLIC_HOLIDAY") pubHol = "✔";
          } else if (sched.shiftCode && shiftsMap[sched.shiftCode]) {
            const sh = shiftsMap[sched.shiftCode];
            nwhFrom = sh.timeFrom; nwhTo = sh.timeTo;
            if (sh.otHrs > 0) {
              otFrom = timeAdd(sh.timeFrom, 9);
              otTo   = sh.timeTo;
              otHrs  = sh.otHrs;
            }
          } else {
            nwhFrom = "9:00 AM"; nwhTo = "6:00 PM";
          }
        } else {
          if (dow===0||dow===6) { nwhFrom="OFFDAY"; nwhTo="OFFDAY"; }
          else { nwhFrom="9:00 AM"; nwhTo="6:00 PM"; }
        }

        total += otHrs;
        rows.push({
          "Date": dateStr, "NWH From": nwhFrom, "NWH To": nwhTo,
          "OT From": otFrom, "OT To": otTo,
          "Total OT (hrs)": otHrs||"",
          "Public Holiday": pubHol, "Remark": sched?.remark||"",
          "Sign": preparedBy||"", "Approver": preparedBy||"", "Appr Date": dateStr
        });
      }
      rows.push({ "Date":"TOTAL","NWH From":"","NWH To":"","OT From":"","OT To":"",
        "Total OT (hrs)": Math.round(total*10)/10,
        "Public Holiday":"","Remark":"","Sign":"","Approver":"","Appr Date":"" });

      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.sheet_add_aoa(ws, [
        ["ONLY GROUP OF COMPANIES - OVERTIME CLAIM FORM"],
        [],
        [`NAME: ${staffDoc.name}`, "","","","", `Employee No: ${staffDoc.empNo}`,"",`Designation: ${staffDoc.designation||""}`],
        [],
        ["DATE","Normal Working Hours","","Overtime","","Total OT","Public Holidays","Remark","Approval","",""],
        ["MONTH/YEAR","From","To","From","To","Normal","","","Sign","Name","Date"]
      ], { origin: "A1" });
      ws["!cols"] = [{wch:14},{wch:14},{wch:14},{wch:12},{wch:12},{wch:12},{wch:14},{wch:28},{wch:14},{wch:16},{wch:14}];
      XLSX.utils.book_append_sheet(wb, ws, (staffDoc.name||"Staff").substring(0,31));
    }

    const buf = XLSX.write(wb, { type:"buffer", bookType:"xlsx" });
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    res.setHeader("Content-Disposition", `attachment; filename="OT_${months[month-1]}_${year}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buf);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
