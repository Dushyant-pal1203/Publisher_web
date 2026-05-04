const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Get settings
router.get("/", requireAuth, async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM settings LIMIT 1");

    if (result.rows.length === 0) {
      // Create default settings
      const defaultResult = await pool.query(
        `INSERT INTO settings (publisher_name, tagline, about, whatsapp_number, contact_email, contact_address, currency, upi_id, bank_details, payment_instructions) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [
          "My Publishing House",
          "Quality Books for Quality Readers",
          "We are dedicated to publishing works that inspire, educate, and entertain readers around the world.",
          "",
          "",
          "",
          "INR",
          "",
          "",
          "",
        ],
      );
      result = defaultResult;
    }

    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update settings (admin only)
router.put("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      publisher_name,
      tagline,
      about,
      whatsapp_number,
      contact_email,
      contact_address,
      currency,
      upi_id,
      bank_details,
      payment_instructions,
    } = req.body;

    // Validation
    if (!publisher_name) {
      return res.status(400).json({ error: "Publisher name is required" });
    }

    // Check if settings exist
    const checkResult = await pool.query("SELECT id FROM settings LIMIT 1");

    let result;
    if (checkResult.rows.length === 0) {
      // Insert new settings
      result = await pool.query(
        `INSERT INTO settings 
         (publisher_name, tagline, about, whatsapp_number, contact_email, 
          contact_address, currency, upi_id, bank_details, payment_instructions) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [
          publisher_name,
          tagline,
          about,
          whatsapp_number,
          contact_email,
          contact_address,
          currency,
          upi_id,
          bank_details,
          payment_instructions,
        ],
      );
    } else {
      // Update existing settings
      result = await pool.query(
        `UPDATE settings SET 
         publisher_name = $1, tagline = $2, about = $3, whatsapp_number = $4,
         contact_email = $5, contact_address = $6, currency = $7,
         upi_id = $8, bank_details = $9, payment_instructions = $10,
         updated_at = NOW()
         WHERE id = $11 RETURNING *`,
        [
          publisher_name,
          tagline,
          about,
          whatsapp_number,
          contact_email,
          contact_address,
          currency,
          upi_id,
          bank_details,
          payment_instructions,
          checkResult.rows[0].id,
        ],
      );
    }

    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Get public settings (no auth required)
router.get("/public", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT publisher_name, tagline, about, contact_email, contact_address, currency, whatsapp_number FROM settings LIMIT 1",
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        settings: {
          publisher_name: "Publishing House",
          tagline: "Books, journals and stories that matter",
          about: "",
          contact_email: "",
          contact_address: "",
          currency: "INR",
          whatsapp_number: "",
        },
      });
    }

    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

module.exports = router;
