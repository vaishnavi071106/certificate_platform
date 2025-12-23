const db = require("./config/db");

console.log("📊 Checking database content...");

db.query("SELECT email FROM participants LIMIT 5", (err, results) => {
  if (err) {
    console.error("Error:", err);
  } else if (results.length === 0) {
    console.log("❌ The 'participants' table is empty. No emails found.");
  } else {
    console.log("✅ Found these emails in your database:");
    results.forEach(row => console.log(`- ${row.email}`));
    console.log("\nTry searching for one of these exactly in your browser test.");
  }
  process.exit();
});