const db = require("../config/db");

const Event = {
  create: (name, callback) => {
    const sql = "INSERT INTO events (name) VALUES (?)";
    db.query(sql, [name], callback);
  },

  getAll: (callback) => {
    const sql = "SELECT * FROM events ORDER BY created_at DESC";
    db.query(sql, callback);
  },

  getById: (id, callback) => {
    const sql = "SELECT * FROM events WHERE id = ?";
    db.query(sql, [id], callback);
  }
};

module.exports = Event;
