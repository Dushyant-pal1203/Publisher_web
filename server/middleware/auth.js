const { pool } = require("../db");

const requireAuth = async (req, res, next) => {
  console.log("Auth middleware - Session:", req.session?.userId);

  if (!req.session || !req.session.userId) {
    console.log("No session or userId found");
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, phone_number, first_name, last_name, role, is_active 
       FROM admin_users WHERE id = $1`,
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      console.log("User not found in database");
      return res.status(401).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      console.log("User account is deactivated");
      return res.status(401).json({ error: "Account is deactivated" });
    }

    req.user = user;
    console.log("Auth successful for user:", user.email || user.phone_number);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
