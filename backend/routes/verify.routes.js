const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ================= VERIFY CERTIFICATE =================
   GET /api/verify/:certificateId
====================================================== */
router.get("/:certificateId", (req, res) => {
  // .trim() ensures that extra spaces at the beginning or end don't break the search
  const certificateId = req.params.certificateId.trim();
  
  console.log(`🔍 Verification attempt for ID: [${certificateId}]`);

  const sql = `
    SELECT 
      c.certificate_uid,
      c.file_path,
      c.issued_at,
      p.name,
      p.email,
      e.name AS event_name
    FROM certificates c
    JOIN participants p ON c.participant_id = p.id
    JOIN events e ON p.event_id = e.id
    WHERE c.certificate_uid = ?
  `;

  db.query(sql, [certificateId], (err, results) => {
    if (err) {
      console.error("❌ DATABASE ERROR DURING VERIFY:", err);
      return res.status(500).json({ valid: false, message: "Server error" });
    }

    if (results.length === 0) {
      console.log(`⚠️  ID not found in database: ${certificateId}`);
      return res.json({ valid: false, message: "Certificate not found" });
    }

    console.log(`✅ Certificate Verified: ${results[0].name} for ${results[0].event_name}`);
    res.json({
      valid: true,
      data: results[0]
    });
  });
});

module.exports = router;