import { pool } from "../../../config/database.js";

const getGroup = async (req, res) => {
  try {
    const sectaId = req.params.id;
    console.log(sectaId);

    const [group] = await pool.query(
      `SELECT 
            sectas.secta_id AS sectaId,
            sectas.secta_name AS sectaName,
            sectas.secta_description AS sectaDescription,
            sectas.secta_picture AS sectaPicture,
            sectas.secta_banner AS sectaBanner,
            sectas.creator_id AS creatorId,
            sectas.updated_by AS updatedBy,
            sectas.created_at AS createdAt,
            sectas.updated_at AS updatedAt,
            (SELECT COUNT(*) FROM secta_follower WHERE secta_follower.secta_id = sectas.secta_id) AS followersCount,
            (SELECT COUNT(*) FROM tuips WHERE tuips.secta = sectas.secta_id) AS tuipsCount,
            MAX(CASE WHEN secta_follower.follower_id = ? THEN 1 ELSE 0 END) AS youFollow
       FROM sectas
       LEFT JOIN secta_follower ON sectas.secta_id = secta_follower.secta_id
       WHERE sectas.secta_id = ?
       GROUP BY sectas.secta_id`,
      [req.userData.id, sectaId]
    );

    if (group.length == 0) {
      res.status(404).json({ message: "Group not found" });
    }
    res.json(group[0]);
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const getGroups = async (req, res) => {
  try {
    const [groups] = await pool.query(`SELECT 
            secta_id as sectaId,
            secta_name as sectaName,
            secta_description as sectaDescription,
            secta_picture as sectaPicture,
            secta_banner as sectaBanner,
            creator_id as creatorId,
            updated_by as updatedBy,
            created_at as createdAt,
            updated_at as updatedAt
            FROM sectas`);

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const createGroup = async (req, res) => {
  try {
    const { sectaName, sectaDescription, sectaBanner } = req.body;
    const sectaPictureParse = req.files[0].filename || null;
    const userData = req.userData;
    await pool.query(
      `INSERT INTO sectas(secta_name, secta_description, secta_picture, secta_banner, creator_id, updated_by) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        sectaName,
        sectaDescription,
        sectaPictureParse,
        sectaBanner,
        userData.id,
        userData.id,
      ]
    );

    res.status(200).json({ message: "Group created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { sectaName, sectaDescription, sectaPicture, sectaBanner } = req.body;
    let params = [];
    let values = [];

    if (sectaName !== undefined) {
      params.push("secta_name");
      values.push(sectaName);
    }
    if (sectaDescription !== undefined) {
      params.push("secta_description");
      values.push(sectaDescription);
    }
    if (sectaPicture !== undefined) {
      params.push("secta_picture");
      values.push(sectaPicture);
    }
    if (sectaBanner !== undefined) {
      params.push("secta_banner");
      values.push(sectaBanner);
    }

    if (params.length == 0) {
      return res.status(200).json({ message: "Update completed" });
    }

    params.push("updated_by");
    values.push(req.userData.id);

    const groupId = req.params.id;

    function crearUpdateString(params, values) {
      let result = [];

      for (let i = 0; i < params.length; i++) {
        result.push(`${params[i]} = '${values[i]}'`);
      }

      return result.join(", ");
    }
    const data = crearUpdateString(params, values);

    const query = "UPDATE sectas SET " + data + " WHERE secta_id = ?";

    await pool.query(query, [groupId]);

    res.status(200).json({ message: "Group updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const followGroup = async (req, res) => {
  try {
    const sectaId = req.params.id;
    const demonId = req.userData.id;
    await pool.query(
      "INSERT INTO secta_follower (secta_id, follower_id) VALUES (?, ?)",
      [sectaId, demonId]
    );
    res.status(201).json({ message: "Group followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const unfollowGroup = async (req, res) => {
  try {
    const sectaId = req.params.id;
    const demonId = req.userData.id;
    await pool.query(
      "DELETE FROM secta_follower WHERE secta_id = ? AND follower_id = ?",
      [sectaId, demonId]
    );
    res.status(200).json({ message: "Group unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const getGroupFollowers = async (req, res) => {
  try {
    const sectaId = req.params.id;
    const [followers] = await pool.query(
      `SELECT 
            secta_follower.demon_id as demonId,
            demons.demon_name as demonName,
            demons.demon_username as demonUsername,
            demons.demon_email as demonEmail,
            demons.demon_picture as demonPicture
            FROM secta_follower
            JOIN demons ON secta_follower.follower_id = demons.demon_id
            WHERE secta_follower.secta_id = ?`,
      [sectaId]
    );
    res.json({ data: followers, meta: { count: followers.length } });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

export {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  followGroup,
  unfollowGroup,
  getGroupFollowers,
};
