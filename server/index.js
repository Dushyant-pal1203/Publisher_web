const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const { pool } = require("./db");
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const orderRoutes = require("./routes/orders");
const dashboardRoutes = require("./routes/dashboard");
const settingsRoutes = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 3000;

// Function to create tables if they don't exist
async function initializeDatabase() {
  try {
    console.log("🔄 Checking database tables...");

    const schemaSQL = fs.readFileSync(
      path.join(__dirname, "db", "schema.sql"),
      "utf8",
    );

    try {
      await pool.query(schemaSQL);
      console.log("✅ Database tables verified/created");
    } catch (err) {
      console.error("\n❌ SCHEMA ERROR:");
      console.error(err.message);
      throw err;
    }

    console.log("✅ Database tables verified/created");

    // Create default admin user if not exists
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await pool.query(
      `
      INSERT INTO admin_users (email, password, first_name, last_name, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `,
      ["admin@example.com", hashedPassword, "Admin", "User", "admin", true],
    );
    console.log("✅ Default admin user ready (admin@example.com / admin123)");

    // Insert sample articles if table is empty
    const articleCount = await pool.query(
      "SELECT COUNT(*) as count FROM articles",
    );
    if (parseInt(articleCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO articles (title, author, type, description, price, currency, in_stock, featured, isbn, published_year, page_count, language, publisher) 
        VALUES 
          ('Journal of South Asian Studies', 'Multiple Authors', 'journal', 'A comprehensive study of South Asian culture, politics, and economics', 49.99, 'INR', true, true, '978-93-8000-001-2', 2024, 250, 'English', 'Academic Press'),
          ('The Quiet Library', 'Alan Beasts', 'book', 'A beautiful collection of stories about silence and discovery', 24.99, 'INR', true, true, '978-93-8000-002-9', 2023, 180, 'English', 'Literary House'),
          ('The European Review', 'European Academic Press', 'journal', 'Spring Issue featuring contemporary European thought', 39.99, 'INR', true, true, '978-93-8000-003-6', 2024, 320, 'English', 'EuroPress'),
          ('Futures from My Mother''s Kitchen', 'Sarah Chen', 'book', 'A heartwarming journey through family recipes and memories', 19.99, 'INR', true, false, '978-93-8000-004-3', 2024, 210, 'English', 'Literary House'),
          ('Children of the Commonwealth', 'Marcus Thompson', 'book', 'An epic tale of friendship across borders', 29.99, 'INR', true, false, '978-93-8000-005-0', 2023, 350, 'English', 'Commonwealth Press')
      `);
      console.log("✅ Sample articles created");
    }

    // Insert default settings if not exists
    const settingsCount = await pool.query(
      "SELECT COUNT(*) as count FROM settings",
    );
    if (parseInt(settingsCount.rows[0].count) === 0) {
      await pool.query(
        `
        INSERT INTO settings (publisher_name, tagline, about, currency) 
        VALUES ($1, $2, $3, $4)
      `,
        [
          "Publishing House",
          "Books, journals and stories that matter",
          "We publish quality academic journals, literary works, and cultural publications that inspire and educate readers worldwide.",
          "INR",
        ],
      );
      console.log("✅ Default settings created");
    }

    console.log("🎉 Database initialization complete!");
  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    process.exit(1);
  }
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Session configuration
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "sessions",
      createTableIfMissing: true,
      pruneSessionInterval: 60,
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  }),
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully");

    // Initialize tables and data
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🔗 CORS enabled for: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
      );
      console.log(`\n📚 Publishing House Management System is ready!`);
      console.log(`🔐 Admin Login: admin@example.com / admin123\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
