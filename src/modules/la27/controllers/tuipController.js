import { pool } from "../../../config/database.js";
import { createTuipService } from "../services/tuipService.js";

const getTuip = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        t.id as tuipId, 
        t.content as tuipContent, 
        t.parent as parent,
        t.quoting as quoting,
        t.secta as secta, 
        t.multimedia as tuipM,
        t.responses_count as responsesCount,
        t.quoting_count as quotingCount,
        t.likes_count as likesCount,
        t.created_at as tuipCreatedAt, 
        d.id as demonId, 
        d.user_name as userName, 
        d.demon_name as demonName,
        d.profile_picture as profilePicture,
        MAX(CASE WHEN l.demon_id = ? THEN 1 ELSE 0 END) as youLiked,
        GROUP_CONCAT(m.file_name) as tuipMultimedia
      FROM tuips t 
      INNER JOIN demons d ON t.demon_id = d.id
      LEFT JOIN likes l ON t.id = l.tuip_id
      LEFT JOIN tuip_media tm ON t.id = tm.tuip_id
      LEFT JOIN media m ON tm.media_id = m.id
      WHERE t.id = ?
      GROUP BY t.id`,
      [req.userData.id, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tuip not found" });
    }
    if (rows[0].tuipMultimedia) {
      rows[0].tuipMultimedia = rows[0].tuipMultimedia.split(",");
    } else {
      rows[0].tuipMultimedia = [];
    }

    const tm = rows[0].tuipM !== null ? rows[0].tuipM.split(",") : [];
    rows[0].tuipMultimedia.push(...tm);
    delete rows[0].tuipM;
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
    const sectaId = req.query.sectaId || null;

    let query = `
      SELECT 
        tuips.id as tuipId, 
        tuips.content as tuipContent, 
        tuips.parent as parent,
        tuips.quoting as quoting,
        tuips.multimedia as tuipM,
        tuips.secta as secta, 
        tuips.responses_count as responsesCount,
        tuips.quoting_count as quotingCount,
        tuips.likes_count as likesCount,
        tuips.created_at as tuipCreatedAt, 
        demons.id as demonId, 
        demons.user_name as userName, 
        demons.demon_name as demonName,
        demons.profile_picture as profilePicture,
        MAX(CASE WHEN likes.demon_id = ? THEN 1 ELSE 0 END) as youLiked,
        GROUP_CONCAT(media.file_name) as tuipMultimedia
      FROM tuips
      INNER JOIN demons ON tuips.demon_id = demons.id
      LEFT JOIN likes ON tuips.id = likes.tuip_id
      LEFT JOIN tuip_media ON tuips.id = tuip_media.tuip_id
      LEFT JOIN media ON tuip_media.media_id = media.id
    `;

    let params = [req.userData.id];

    if (authorId) {
      query += " WHERE tuips.demon_id = ?";
      params.push(authorId);
    }

    if (likedById) {
      query += (authorId ? " AND" : " WHERE") + " likes.demon_id = ?";
      params.push(likedById);
    }

    if (sectaId) {
      query += (authorId || likedById ? " AND" : " WHERE") + " tuips.secta = ?";
      params.push(sectaId);
    }

    query += `
      GROUP BY tuips.id, demons.id
      ORDER BY tuips.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.query(query, params);

    const parseRows = rows.map((row) => ({
      ...row,
      tuipMultimedia: row.tuipMultimedia ? row.tuipMultimedia.split(",") : [],
    }));
    parseRows.forEach((element) => {
      if (element.tuipM !== null) {
        const tm = element.tuipM.split(",");
        element.tuipMultimedia.push(...tm);
      }
      delete element.tuipM;
    });
    res.json(parseRows);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const setLike = async (req, res) => {
  try {
    const tuipId = req.params.id;
    const demonId = req.userData.id;
    await pool.query("INSERT INTO likes (tuip_id, demon_id) VALUES (?, ?)", [
      tuipId,
      demonId,
    ]);
    await pool.query(
      "UPDATE tuips SET likes_count = likes_count + 1 WHERE id = ?",
      [tuipId]
    );
    res.status(201).json({ message: "Tuip liked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const removeLike = async (req, res) => {
  try {
    const tuipId = req.params.id;
    const demonId = req.userData.id;
    await pool.query("DELETE FROM likes WHERE tuip_id = ? AND demon_id = ?", [
      tuipId,
      demonId,
    ]);
    await pool.query(
      "UPDATE tuips SET likes_count = likes_count - 1 WHERE id = ?",
      [tuipId]
    );
    res.status(200).json({ message: "Tuip unliked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const createTuip = async (req, res) => {
  try {
    const { content, parent, quoting, secta } = req.body;
    const userData = req.userData;
    const files = req.files || [];

    const tuip = await createTuipService({
      demonId: userData.id,
      content,
      parent: parent || null,
      quoting: quoting || null,
      secta: secta || null,
      files,
    });

    res
      .status(201)
      .json({ message: "Tuip created successfully", tuipId: tuip.id });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const getEndemoniados = async (req, res) => {
  try {
    const query = `
    SELECT 
      t.id as tuipId,
      t.content as tuipContent, 
      t.multimedia as tuipMultimedia,
      t.secta as secta, 
      t.responses_count as responsesCount,
      t.quoting_count as quotingCount,
      t.likes_count as likesCount,
      t.responses_count + t.quoting_count + t.likes_count as interactions,
      t.created_at as tuipCreatedAt,
      d.id as demonId,
      d.demon_name as demonName,
      d.user_name as userName,
      d.profile_picture as profilePicture
    FROM tuips t
    INNER JOIN demons d
    ON t.demon_id = d.id
    WHERE t.created_at > CURRENT_TIMESTAMP - INTERVAL 7 DAY
    ORDER BY interactions DESC
    `;
    const [lastWeekTuips] = await pool.query(query);

    /* for(const tuip of lastWeekTuips){
      const likesQuery = `SELECT COUNT(*) as likesCount FROM likes WHERE tuip_id = ?`
      const [likesCount] = await pool.query(likesQuery, [tuip.tuipId]);
      tuip.likesCount = likesCount[0].likesCount;

      const quotesQuery = `SELECT COUNT(*) as quotesCount FROM tuips WHERE quoting = ?`
      const [quotesCount] = await pool.query(quotesQuery, [tuip.tuipId]);
      tuip.quotesCount = quotesCount[0].quotesCount;

      const responseQuery = `SELECT COUNT(*) as responseCount FROM tuips WHERE parent = ?`
      const [responseCount] = await pool.query(responseQuery, [tuip.tuipId]);
      tuip.responseCount = responseCount[0].responseCount;

      tuip.interactions = tuip.likesCount + tuip.quotesCount + tuip.responseCount;
    }

    lastWeekTuips.sort(function (a, b) {
      if (a.interactions > b.interactions) {
        return -1;
      }
      if (a.interactions < b.interactions) {
        return 1;
      }
      return 0;
    });
*/
    res.json(lastWeekTuips);
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

export { getTuip, createTuip, getTuips, setLike, removeLike, getEndemoniados };
