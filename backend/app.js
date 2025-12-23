const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Corrected line here:
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

/* -------------------- ROUTES -------------------- */
app.use("/api/events", require("./routes/event.routes"));
app.use("/api/certificates", require("./routes/certificate.routes"));
app.use("/api/verify", require("./routes/verify.routes"));

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.send("Certificate Platform Backend Running");
});

module.exports = app;