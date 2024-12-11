import { pool } from "../config/database.js";

const getUser = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

export { getUser };
