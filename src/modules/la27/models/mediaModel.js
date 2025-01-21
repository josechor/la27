import { pool } from "../../../config/database.js";

async function findMediaByChecksum(checksum) {
  const query = "SELECT * FROM media WHERE checksum = ? LIMIT 1";
  const [rows] = await pool.query(query, [checksum]);
  if (rows.length) {
    return {
      id: rows[0].id,
      filename: rows[0].file_name,
      fileType: rows[0].file_type,
      fileSize: rows[0].file_size,
      checksum: rows[0].checksum,
    };
  }
  return null;
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
