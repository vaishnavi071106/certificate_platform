
const db = require("../config/db");

const Certificate = {
  create: (certificateUID, participantId, filePath, callback) => {
    const sql = `
      INSERT INTO certificates (certificate_uid, participant_id, file_path)
      VALUES (?, ?, ?)
    `;
    db.query(sql, [certificateUID, participantId, filePath], callback);
  },

  findByUID: (uid, callback) => {
    const sql = `
      SELECT c.certificate_uid, c.file_path, c.issued_at,
             p.name, p.email, e.name AS event_name
      FROM certificates c
      JOIN participants p ON c.participant_id = p.id
      JOIN events e ON p.event_id = e.id
      WHERE c.certificate_uid = ?
    `;
    db.query(sql, [uid], callback);
  }
};

module.exports = Certificate;
