import { pool } from "../config/database.js";
import { compare, hash } from "bcrypt"

const getUser = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT demon_name, user_name, email FROM demons WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(rows[0]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, demon_name, user_name, password } = req.body;
    const hasedPassword = await hash(password, 10);

    console.log(hasedPassword);
    const query =
      "INSERT INTO demons (email, demon_name, user_name, password) VALUES (?, ?, ?, ?)";
    await pool.query(query, [email, demon_name, user_name, hasedPassword]);
    console.log("User created successfully");

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM demons WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

export { getUser, createUser, loginUser };
