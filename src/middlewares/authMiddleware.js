import { pool } from "../config/database.js"; // Asegúrate de tener acceso a la conexión con la base de datos

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Demon-Token");
    if (!token) {
      return res.status(498).json({ error: "No token provided" });
    }

    const [sessionRows] = await pool.query(
      "SELECT user_id FROM session_token WHERE token = ?",
      [token]
    );
    if (sessionRows.length === 0) {
      return res.status(498).json({ error: "Invalid or expired token" });
    }

    const userId = sessionRows[0].user_id;
    const [userRows] = await pool.query("SELECT id, user_name as userName FROM demons WHERE id = ?", [
      userId,
    ]);
    if (userRows.length === 0) {
      return res.status(498).json({ error: "User not found" });
    }

    req.userData = userRows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default authMiddleware;
