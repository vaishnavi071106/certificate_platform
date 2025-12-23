const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * CREATE EVENT
 * POST /api/events/create
 */
router.post("/create", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Event name is required" });
  }

  db.query(
    "INSERT INTO events (name) VALUES (?)",
    [name],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        message: "Event created successfully",
        eventId: result.insertId
      });
    }
  );
});

module.exports = router;
