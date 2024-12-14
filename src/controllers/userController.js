import { pool } from "../config/database.js";
import { compare, hash } from "bcrypt";

const getUser = async (req, res) => {
  try {
    const [userdata] = await pool.query(
      "SELECT id as userId, user_name as userName, demon_name as demonName, email, " +
        "profile_picture as profilePicture, banner, description, pinned_tuip_id as pinnedTuipId, created_at as createdAt, birthday FROM demons WHERE user_name = ?",
      [req.params.username]
    );
    if (userdata.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const [followersdata] = await pool.query(
      "SELECT COUNT(*) as followers FROM followers WHERE followed_id = ?",
      [userdata[0].userId]
    );
    const [followingdata] = await pool.query(
      "SELECT COUNT(*) as following FROM followers WHERE follower_id = ?",
      [userdata[0].userId]
    );
    const [tuipsdata] = await pool.query(
      "SELECT COUNT(*) as tuipsCount FROM tuips WHERE demon_id = ?",
      [userdata[0].userId]
    );
    const [likesdata] = await pool.query(
      "SELECT COUNT(*) as likesCount FROM magrada WHERE demon_id = ?",
      [userdata[0].userId]
    );

    console.log({
      ...userdata[0],
      ...followersdata[0],
      ...followingdata[0],
      ...tuipsdata[0],
      ...likesdata[0],
    });
    res.json({
      ...userdata[0],
      ...followersdata[0],
      ...followingdata[0],
      ...tuipsdata[0],
      ...likesdata[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const getFollowers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT d.demon_name, d.user_name FROM demons d JOIN followers f ON d.id = f.follower_id  WHERE f.followed_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(200).json({ message: "No followers found" });
    }
    console.log(rows);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const getFollowing = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT d.demon_name, d.user_name FROM demons d JOIN followers f ON d.id = f.followed_id  WHERE f.follower_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(200).json({ message: "No follows found" });
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, demonName, userName, password } = req.body;
    const hasedPassword = await hash(password, 10);
    const userRandomUUID = crypto.randomUUID();
    const query =
      "INSERT INTO demons (id, email, demon_name, user_name, password) VALUES (?, ?, ?, ?, ?)";
    await pool.query(query, [
      userRandomUUID,
      email,
      demonName,
      userName,
      hasedPassword,
    ]);
    await pool.query(
      "INSERT INTO session_token (user_id, token) VALUES (?, ?)",
      [userRandomUUID, crypto.randomUUID()]
    );

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
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

    const [session] = await pool.query(
      "SELECT token FROM session_token WHERE user_id = ?",
      [user.id]
    );
    if (session.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ token: session[0].token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

export { getUser, getFollowers, getFollowing, createUser, authUser };
