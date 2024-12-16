import { pool } from "../config/database.js";

const getTuip = async (req, res) => {
  try {
    console.log(req.userData.id)

    const [rows] = await pool.query(
      `SELECT 
        t.id as tuipId, 
        t.content as tuipContent, 
        t.multimedia as tuipMultimedia,
        t.parent as parent,
        t.quoting as quoting,
        t.secta as secta, 
        t.created_at as tuipCreatedAt, 
        d.id as demonId, 
        d.user_name as userName, 
        d.demon_name as demonName,
        d.profile_picture as profilePicture,
        COUNT(m.demon_id) as magradaCount,
        MAX(CASE WHEN m.demon_id = ? THEN 1 ELSE 0 END) as youLiked
      FROM tuips t 
      INNER JOIN demons d ON t.demon_id = d.id
      LEFT JOIN magrada m ON t.id = m.tuip_id
      WHERE t.id = ?`,
      [req.userData.id, req.params.id]
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
        tuips.parent as parent,
        tuips.quoting as quoting,
        tuips.secta as secta, 
        tuips.created_at as tuipCreatedAt, 
        demons.id as demonId, 
        demons.user_name as userName, 
        demons.demon_name as demonName,
        demons.profile_picture as profilePicture,
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
    const { content, multimedia, parent, quoting, secta } = req.body;
    const userData = req.userData;
    const query =
      "INSERT INTO tuips (demon_id, content, multimedia, parent, quoting, secta) VALUES (?, ?, ?, ?, ?, ?)";
    await pool.query(query, [userData.id, content, multimedia, parent, quoting, secta]);
    res.status(201).json({ message: "Tuip created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const getEndemoniados = async(req, res) => {
  try{
    const query = `
    SELECT 
      t.id,
      t.content as tuipContent, 
      t.multimedia as tuipMultimedia,
      t.secta as secta, 
      t.created_at as tuipCreatedAt,
    FROM tuips t
    WHERE t.created_at > CURRENT_DATETIME - INTERVAL 7 DAY
    `
    const [lastWeekTuips] = await pool.query(query);
    for(tuip in lastWeekTuips){

    }

    res.json(lastWeekTuips);
    
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
}

export { getTuip, createTuip, getTuips, setLike, removeLike, getEndemoniados };
