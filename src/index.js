import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());

// Configuración de la conexión a MySQL
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
};

// Ruta de prueba para verificar la conexión a la base de datos
app.get("/api/test", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT NOW() AS currentTime");
    res.json({ success: true, currentTime: rows[0].currentTime });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Ruta para obtener todos los tweets
app.get("/api/tweets", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [tweets] = await connection.execute("SELECT * FROM tweets");
    res.json({ success: true, tweets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Inicia el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});

