const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { createCanvas, loadImage } = require("canvas");
const db = require("../config/db");
const util = require("util");

// Promisify database queries for better async handling
const query = util.promisify(db.query).bind(db);

/* ================= CONFIGURATION ================= */
const upload = multer({ dest: "uploads/" });

// Ensure the certificates folder exists
if (!fs.existsSync("certificates")) {
    fs.mkdirSync("certificates");
}

/* ================= 1. FETCH BY EMAIL ================= 
   Used by the Participant Dashboard to find their certs
====================================================== */
router.get("/by-email/:email", async (req, res) => {
    try {
        const email = req.params.email.trim();
        console.log(`🔍 Searching certificates for: ${email}`);

        const sql = `
            SELECT 
                c.certificate_uid, 
                c.file_path, 
                c.issued_at, 
                e.name AS event_name
            FROM certificates c
            JOIN participants p ON c.participant_id = p.id
            JOIN events e ON p.event_id = e.id
            WHERE p.email = ?
        `;

        const results = await query(sql, [email]);
        res.json({ certificates: results });
    } catch (err) {
        console.error("❌ FETCH ERROR:", err);
        res.status(500).json({ message: "Server error while fetching" });
    }
});

/* ================= 2. GENERATE CERTIFICATES ================= 
   Used by the Admin to upload CSV and Template
=========================================================== */
router.post(
    "/generate",
    upload.fields([
        { name: "template", maxCount: 1 },
        { name: "csv", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            if (!req.body.eventName) return res.status(400).json({ message: "Event name required" });
            if (!req.files.template || !req.files.csv) return res.status(400).json({ message: "Files missing" });

            const eventName = req.body.eventName.trim();
            const templatePath = req.files.template[0].path;
            const csvPath = req.files.csv[0].path;

            // Insert Event
            const eventResult = await query("INSERT INTO events (name) VALUES (?)", [eventName]);
            const eventId = eventResult.insertId;

            const participants = [];

            // Read CSV
            fs.createReadStream(csvPath)
                .pipe(csv())
                .on("data", (row) => participants.push(row))
                .on("end", async () => {
                    console.log(`🚀 Processing ${participants.length} certificates...`);

                    for (const p of participants) {
                        // Handle both 'name' and 'Name' headers
                        const name = p.name || p.Name;
                        const email = p.email || p.Email;

                        if (!name || !email) continue;

                        try {
                            // 1. Insert Participant
                            const pResult = await query(
                                "INSERT INTO participants (name, email, event_id) VALUES (?, ?, ?)",
                                [name, email, eventId]
                            );
                            const participantId = pResult.insertId;

                            // 2. Setup File Info
                            const uid = uuidv4();
                            const outputPath = path.join("certificates", `${uid}.png`);

                            // 3. Generate Image (with dynamic scaling)
                            await generateCertificateImage(templatePath, name, uid, outputPath);

                            // 4. Link Certificate in DB
                            await query(
                                "INSERT INTO certificates (certificate_uid, participant_id, file_path) VALUES (?, ?, ?)",
                                [uid, participantId, outputPath]
                            );
                            
                            console.log(`✅ Generated for: ${email}`);
                        } catch (loopErr) {
                            console.error(`❌ Error for ${email}:`, loopErr);
                        }
                    }

                    res.json({ message: "Certificates generated successfully", total: participants.length });
                });
        } catch (err) {
            console.error("❌ GENERATION ERROR:", err);
            res.status(500).json({ message: "Server error during generation" });
        }
    }
);

/* ================= 3. IMAGE GENERATOR HELPER ================= 
   Fixes the "Cut Off" and "Too Big" font issues
============================================================= */
async function generateCertificateImage(templatePath, name, uid, outputPath) {
    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(image, 0, 0);

    // --- NAME STYLING ---
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Initial font size: 8% of the image height
    let fontSize = Math.floor(image.height * 0.08); 
    const maxWidth = image.width * 0.8; // Don't exceed 80% of width

    // Shrink font if name is too wide
    do {
        ctx.font = `bold ${fontSize}px Arial`;
        fontSize -= 2;
    } while (ctx.measureText(name).width > maxWidth && fontSize > 20);

    // Draw Name at the center (50% width, 50% height)
    // Adjust 0.5 to 0.52 or 0.48 if you need to move it slightly up/down
    ctx.fillText(name, image.width / 2, image.height * 0.5);

    // --- ID STYLING (Small at the bottom) ---
    const idSize = Math.floor(image.height * 0.025);
    ctx.font = `${idSize}px Arial`;
    ctx.fillStyle = "#555555";
    ctx.fillText(`Verify ID: ${uid}`, image.width / 2, image.height * 0.93);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);
}

module.exports = router;