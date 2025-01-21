import { pool } from "../../../config/database.js";

async function findMediaByChecksum(checksum) {
  const query = "SELECT * FROM media WHERE checksum = ? LIMIT 1";
  const [rows] = await pool.query(query, [checksum]);
  return rows.length ? rows[0] : null;
}

async function saveMediaToDatabase({ filename, fileType, fileSize, checksum }) {
  const query =
    "INSERT INTO media (file_name, file_type, file_size, checksum) VALUES (?, ?, ?, ?)";
  const [result] = await pool.execute(query, [
    filename,
    fileType,
    fileSize,
    checksum,
  ]);

  return {
    id: result.insertId,
    filename,
    fileType,
    fileSize,
    checksum,
  };
}

export { findMediaByChecksum, saveMediaToDatabase };
