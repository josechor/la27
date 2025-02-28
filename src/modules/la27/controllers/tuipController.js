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
        GROUP_CONCAT(DISTINCT m.file_name) as tuipMultimedia
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
        tuips.parent as parentId,
        tuips.quoting as quotingId,
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
        GROUP_CONCAT(DISTINCT media.file_name) as tuipMultimedia,

        parentTuip.id as parentTuipId,
        parentTuip.content as parentTuipContent,
        parentTuip.responses_count as parentResponsesCount,
        parentTuip.quoting_count as parentQuotingCount,
        parentTuip.likes_count as parentLikesCount,
        parentTuip.created_at as parentCreatedAt,
        parentDemon.id as parentDemonId,
        parentDemon.user_name as parentUserName,
        parentDemon.demon_name as parentDemonName,
        parentDemon.profile_picture as parentProfilePicture,
        MAX(CASE WHEN parentLikes.demon_id = ? THEN 1 ELSE 0 END) as parentYouLiked,
        GROUP_CONCAT(DISTINCT parentMedia.file_name) as parentTuipMultimedia,

        quotingTuip.id as quotingTuipId,
        quotingTuip.content as quotingTuipContent,
        quotingTuip.responses_count as quotingResponsesCount,
        quotingTuip.quoting_count as quotingQuotingCount,
        quotingTuip.likes_count as quotingLikesCount,
        quotingTuip.created_at as quotingCreatedAt,
        quotingDemon.id as quotingDemonId,
        quotingDemon.user_name as quotingUserName,
        quotingDemon.demon_name as quotingDemonName,
        quotingDemon.profile_picture as quotingProfilePicture,
        MAX(CASE WHEN quotingLikes.demon_id = ? THEN 1 ELSE 0 END) as quotingYouLiked,
        GROUP_CONCAT(DISTINCT quotingMedia.file_name) as quotingTuipMultimedia

      FROM tuips
      INNER JOIN demons ON tuips.demon_id = demons.id
      LEFT JOIN likes ON tuips.id = likes.tuip_id
      LEFT JOIN tuip_media ON tuips.id = tuip_media.tuip_id
      LEFT JOIN media ON tuip_media.media_id = media.id

      LEFT JOIN tuips as parentTuip ON tuips.parent = parentTuip.id
      LEFT JOIN demons as parentDemon ON parentTuip.demon_id = parentDemon.id
      LEFT JOIN likes as parentLikes ON parentTuip.id = parentLikes.tuip_id
      LEFT JOIN tuip_media as parentTuipMedia ON parentTuip.id = parentTuipMedia.tuip_id
      LEFT JOIN media as parentMedia ON parentTuipMedia.media_id = parentMedia.id

      LEFT JOIN tuips as quotingTuip ON tuips.quoting = quotingTuip.id
      LEFT JOIN demons as quotingDemon ON quotingTuip.demon_id = quotingDemon.id
      LEFT JOIN likes as quotingLikes ON quotingTuip.id = quotingLikes.tuip_id
      LEFT JOIN tuip_media as quotingTuipMedia ON quotingTuip.id = quotingTuipMedia.tuip_id
      LEFT JOIN media as quotingMedia ON quotingTuipMedia.media_id = quotingMedia.id
    `;

    let params = [req.userData.id, req.userData.id, req.userData.id];

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
      GROUP BY tuips.id, demons.id, parentTuip.id, parentDemon.id, quotingTuip.id, quotingDemon.id
      ORDER BY tuips.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.query(query, params);

    const parseRows = rows.map((row) => {
      const tuip = {
        tuipId: row.tuipId,
        tuipContent: row.tuipContent,
        secta: row.secta,
        responsesCount: row.responsesCount,
        quotingCount: row.quotingCount,
        likesCount: row.likesCount,
        tuipCreatedAt: row.tuipCreatedAt,
        demonId: row.demonId,
        userName: row.userName,
        demonName: row.demonName,
        profilePicture: row.profilePicture,
        youLiked: row.youLiked,
        tuipMultimedia: row.tuipMultimedia ? row.tuipMultimedia.split(",") : [],
      };

      if (row.parentTuipId) {
        tuip.parent = row.parentTuipId;
        tuip.parentData = {
          tuipId: row.parentTuipId,
          tuipContent: row.parentTuipContent,
          responsesCount: row.parentResponsesCount,
          quotingCount: row.parentQuotingCount,
          likesCount: row.parentLikesCount,
          tuipCreatedAt: row.parentCreatedAt,
          demonId: row.parentDemonId,
          userName: row.parentUserName,
          demonName: row.parentDemonName,
          profilePicture: row.parentProfilePicture,
          youLiked: row.parentYouLiked,
          tuipMultimedia: row.parentTuipMultimedia
            ? row.parentTuipMultimedia.split(",")
            : [],
        };
      } else {
        tuip.parent = null;
        tuip.parentData = null;
      }

      if (row.quotingTuipId) {
        tuip.quoting = row.quotingTuipId;
        tuip.quotingData = {
          tuipId: row.quotingTuipId,
          tuipContent: row.quotingTuipContent,
          responsesCount: row.quotingResponsesCount,
          quotingCount: row.quotingQuotingCount,
          likesCount: row.quotingLikesCount,
          tuipCreatedAt: row.quotingCreatedAt,
          demonId: row.quotingDemonId,
          userName: row.quotingUserName,
          demonName: row.quotingDemonName,
          profilePicture: row.quotingProfilePicture,
          youLiked: row.quotingYouLiked,
          tuipMultimedia: row.quotingTuipMultimedia
            ? row.quotingTuipMultimedia.split(",")
            : [],
        };
      } else {
        tuip.quoting = null;
        tuip.quotingData = null;
      }

      return tuip;
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
