const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const managerOrAdmin = (req, res, next) => {
  if (!["ADMIN","MANAGER"].includes(req.user.role))
    return res.status(403).json({ error: "Access denied" });
  next();
};

module.exports = { authenticate, managerOrAdmin };
