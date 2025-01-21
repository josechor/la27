import { pool } from "../../../config/database.js";

export const getConnection = () => pool.getConnection();

export const insertTuip = async (
  connection,
  { demonId, content, parent, quoting, secta }
) => {
  const query =
    "INSERT INTO tuips (demon_id, content, multimedia, parent, quoting, secta) VALUES (?, ?, ?, ?, ?, ?)";
  const [result] = await connection.query(query, [
    demonId,
    content,
    null,
    parent,
    quoting,
    secta,
  ]);

  return result.insertId;
};

export const insertTuipMedia = async (connection, tuipId, mediaId) => {
  const query = "INSERT INTO tuip_media (tuip_id, media_id) VALUES (?, ?)";
  await connection.query(query, [tuipId, mediaId]);
};
