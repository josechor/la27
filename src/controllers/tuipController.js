import { pool } from "../config/database.js";

const getTuip = async(req, res) => {
    try{
        const [rows] = await pool.query("SELECT content, demon_id, multimedia, created_at FROM tuips WHERE id = ?", 
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
}

const createTuip = async(req, res) => {
    try{
        const { demon_id, content, multimedia } = req.body;
        const query =
            "INSERT INTO tuips (demon_id, content, multimedia) VALUES (?, ?, ?)";
        await pool.query(query, [demon_id, content, multimedia]);
        console.log("Tuip tuipeado exitosamente");
    } catch (error) {
        res.status(500).json({ message: "Internal server error: ", error });
    }
}

export { getTuip, createTuip }