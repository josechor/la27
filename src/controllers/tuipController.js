import { pool } from "../config/database.js";

const getTuip = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT content, demon_id, multimedia, created_at FROM tuips WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tuip not found" });
    }
    console.log(rows[0]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const getTuips = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const page = parseInt(req.query.page, 10) || 1;

    const authorId = req.query.authorId || null;
    const likedById = req.query.likedById || null;

    let query = `
      SELECT 
        tuips.id as tuipId, 
        tuips.content as tuipContent, 
        tuips.multimedia as tuipMultimedia, 
        tuips.created_at as tuipCreatedAt, 
        demons.id as demonId, 
        demons.user_name as userName, 
        demons.demon_name as demonName,
        COUNT(magrada.demon_id) as magradaCount,
        MAX(CASE WHEN magrada.demon_id = ? THEN 1 ELSE 0 END) as youLiked
      FROM tuips
      INNER JOIN demons ON tuips.demon_id = demons.id
      LEFT JOIN magrada ON tuips.id = magrada.tuip_id
    `;

    let params = [req.userData.id];

    if (authorId) {
      query += " WHERE tuips.demon_id = ?";
      params.push(authorId);
    }

    if (likedById) {
      query += (authorId ? " AND" : " WHERE") + " magrada.demon_id = ?";
      params.push(likedById);
    }

    query += `
      GROUP BY tuips.id, demons.id
      ORDER BY tuips.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, (page - 1) * limit);
    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const setLike = async (req, res) => {
  try {
    const tuipId = req.params.id;
    const demonId = req.userData.id;
    await pool.query("INSERT INTO magrada (tuip_id, demon_id) VALUES (?, ?)", [
      tuipId,
      demonId,
    ]);
    res.status(201).json({ message: "Tuip liked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const removeLike = async (req, res) => {
  try {
    const tuipId = req.params.id;
    const demonId = req.userData.id;
    await pool.query("DELETE FROM magrada WHERE tuip_id = ? AND demon_id = ?", [
      tuipId,
      demonId,
    ]);
    res.status(200).json({ message: "Tuip unliked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const createTuip = async (req, res) => {
  try {
    const { content, multimedia } = req.body;
    const userData = req.userData;
    const query =
      "INSERT INTO tuips (demon_id, content, multimedia) VALUES (?, ?, ?)";
    await pool.query(query, [userData.id, content, multimedia]);
    res.status(201).json({ message: "Tuip created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

export { getTuip, createTuip, getTuips, setLike, removeLike };
