require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("./models/User");
const Staff    = require("./models/Staff");
const Shift    = require("./models/Shift");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB Atlas");

  // Admin user
  const exists = await User.findOne({ email: "admin@owg.com" });
  if (!exists) {
    await User.create({ email:"admin@owg.com", password: await bcrypt.hash("admin123",10), name:"Admin", role:"ADMIN" });
    console.log("✅ Admin user: admin@owg.com / admin123");
  } else {
    console.log("ℹ️ Admin already exists");
  }

  // Shifts
  const shifts = [
    { code:"A", timeFrom:"9:00 AM",  timeTo:"9:00 PM",  totalHrs:12, otHrs:3 },
    { code:"B", timeFrom:"10:00 AM", timeTo:"10:00 PM", totalHrs:12, otHrs:3 },
    { code:"C", timeFrom:"11:00 AM", timeTo:"11:00 PM", totalHrs:12, otHrs:3 },
    { code:"D", timeFrom:"12:00 PM", timeTo:"12:00 AM", totalHrs:12, otHrs:3 },
    { code:"E", timeFrom:"1:00 PM",  timeTo:"1:00 AM",  totalHrs:12, otHrs:3 },
    { code:"F", timeFrom:"9:00 AM",  timeTo:"8:00 PM",  totalHrs:11, otHrs:2 },
    { code:"G", timeFrom:"10:00 AM", timeTo:"9:00 PM",  totalHrs:11, otHrs:2 },
    { code:"H", timeFrom:"11:00 AM", timeTo:"10:00 PM", totalHrs:11, otHrs:2 },
    { code:"I", timeFrom:"12:00 PM", timeTo:"11:00 PM", totalHrs:11, otHrs:2 },
    { code:"J", timeFrom:"1:00 PM",  timeTo:"12:00 AM", totalHrs:11, otHrs:2 },
    { code:"K", timeFrom:"9:00 AM",  timeTo:"6:00 PM",  totalHrs:9,  otHrs:0 },
    { code:"L", timeFrom:"10:00 AM", timeTo:"7:00 PM",  totalHrs:9,  otHrs:0 },
    { code:"M", timeFrom:"11:00 AM", timeTo:"8:00 PM",  totalHrs:9,  otHrs:0 },
    { code:"N", timeFrom:"1:00 AM",  timeTo:"10:00 PM", totalHrs:9,  otHrs:0 },
    { code:"O", timeFrom:"12:00 PM", timeTo:"9:00 PM",  totalHrs:9,  otHrs:0 },
    { code:"P", timeFrom:"8:00 AM",  timeTo:"7:00 PM",  totalHrs:11, otHrs:2 },
    { code:"Q", timeFrom:"8:00 AM",  timeTo:"5:00 PM",  totalHrs:9,  otHrs:0 }
  ];
  for (const s of shifts) {
    await Shift.findOneAndUpdate({ code:s.code }, s, { upsert:true });
  }
  console.log(`✅ ${shifts.length} shifts seeded`);

  // Staff
  const staffList = [
    { name:"NAEEM KHAN",            empNo:"13651", designation:"Senior Incharge" },
    { name:"KONTALA BABU RAO",      empNo:"12964", designation:"Senior Technician" },
    { name:"KAMARAN MUHAMMAD",      empNo:"50432", designation:"Assistant Technician" },
    { name:"SHAH AKRAM",            empNo:"50436", designation:"" },
    { name:"TUN KYAW",              empNo:"24450", designation:"" },
    { name:"AYEZAW",                empNo:"24531", designation:"" },
    { name:"NARENDRA NATH MALLICK", empNo:"16230", designation:"" },
    { name:"MD MYNUL ISLAM",        empNo:"16227", designation:"" },
    { name:"SURANJAN",              empNo:"16148", designation:"" },
    { name:"BAHADUR BAGALE",        empNo:"16300", designation:"" }
  ];
  for (const s of staffList) {
    await Staff.findOneAndUpdate({ empNo:s.empNo }, s, { upsert:true });
  }
  console.log(`✅ ${staffList.length} staff seeded`);
  console.log("\n🎉 Seeding complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
