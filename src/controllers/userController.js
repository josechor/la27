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

const getUserData = async (req, res) => {
  try {
    const [userdata] = await pool.query(
      "SELECT id as userId, user_name as userName, demon_name as demonName, email, " +
        "profile_picture as profilePicture, banner, description, pinned_tuip_id as pinnedTuipId, created_at as createdAt, birthday FROM demons WHERE user_name = ?",
      [req.userData.userName]
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
      "SELECT d.demon_name, d.user_name FROM demons d JOIN followers f ON d.id = f.follower_id  WHERE f.followed_id = (SELECT id FROM demons WHERE user_name = ?)",
      [req.params.username]
    );
    if (rows.length === 0) {
      return res.status(200).json({ message: "No followers found" });
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
};

const getFollowing = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT d.demon_name, d.user_name FROM demons d JOIN followers f ON d.id = f.followed_id  WHERE f.follower_id = (SELECT id FROM demons WHERE user_name = ?)",
      [req.params.username]
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

const updateUser = async (req, res) => {
  try{
    const { userName, demonName, email, profilePicture, banner, description, pinnedTuipId, birthday, password } = req.body;
    let params = [];
    let values = [];
    if (userName !== undefined) {
      params.push("user_name");
      values.push(userName);
    }
    if (demonName !== undefined) {
      params.push("demon_name");
      values.push(demonName);
    }
    if (email !== undefined) {
      params.push("email");
      values.push(email);
    }
    if (profilePicture !== undefined) {
      params.push("profile_picture");
      values.push(profilePicture);
    }
    if (banner !== undefined) {
      params.push("banner");
      values.push(banner);
    }
    if (description !== undefined) {
      params.push("description");
      values.push(description);
    }
    if (pinnedTuipId !== undefined) {
      params.push("pinned_tuip_id");
      values.push(pinnedTuipId);
    }
    if (birthday !== undefined) {
      params.push("birthday");
      values.push(birthday);
    }
    if (password !== undefined) {
      params.push("password");
      values.push(await hash(password, 10));
    }

    if(params.length == 0){
      return res.status(200).json({message: "Update completed"});
    }

    const userData = req.userData;

    function crearUpdateString(params, values) {
      let result = [];
    
      for (let i = 0; i < params.length; i++) {
        result.push(`${params[i]} = '${values[i]}'`);
      }
    
      return result.join(', ');
    }
    const data = crearUpdateString(params, values);

    const query =
      "UPDATE demons SET " + data + " WHERE id = ?";

    await pool.query(query, [userData.id]);

    res.status(200).json({ message: "User updated successfully" });    
  }catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
}

const followUser = async (req, res) => {
  try{
    const [followedid] = await pool.query("SELECT id FROM demons WHERE user_name = ?", [req.params.username]);
    const userData = req.userData;
    if(followedid.length == 0){
      return res.status(404).json({message: "User not found"});
    }
    const query =
      "INSERT INTO followers(follower_id, followed_id) VALUES (?, ?)";

    await pool.query(query, [userData.id, followedid[0].id]);
    return res.status(200).json({message: "User followed successfully"});
  }catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
}

const unfollowUser = async (req, res) => {
  try{
    const [followedid] = await pool.query("SELECT id FROM demons WHERE user_name = ?", [req.params.username]);
    const userData = req.userData;
    if(followedid.length == 0){
      return res.status(404).json({message: "User not found"});
    }
    const query = "DELETE FROM followers WHERE follower_id = ?  AND followed_id = ?";
    await pool.query(query, [userData.id, followedid[0].id]);
    return res.status(200).json({message: "User unfollowed successfully"});

  }catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
}

const searchUsers = async (req, res) =>{
  try{
    const searchQuery = req.query.query;
    const limit = parseInt(req.query.limit, 10) || 20;
    const page = parseInt(req.query.page, 10) || 1;  
    const userData = req.userData;

    const [rows] = await pool.query(`SELECT id, user_name as userName, demon_name as demonName, description, profile_picture as profilePicture FROM demons WHERE user_name LIKE '%${searchQuery}%' OR demon_name LIKE '%${searchQuery}%' ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, (page - 1) * limit]
    );
    for (const row of rows) {
      const [followed] = await pool.query("SELECT COUNT(*) as count FROM followers WHERE follower_id = ? AND followed_id = ?;", [userData.id, row.id])
      row.followed = followed[0].count > 0 ? true : false;
      const [following] = await pool.query("SELECT COUNT(*) as count FROM followers WHERE follower_id = ? AND followed_id = ?;", [row.id, userData.id])
      row.following = following[0].count > 0 ? true : false;
      const [commonFollows] = await pool.query("SELECT COUNT(*) as count FROM followers f1 JOIN followers f2 ON f1.followed_id = f2.follower_id WHERE f1.follower_id = ? AND f2.followed_id = ?;", [userData.id, row.id])
      row.commonFollowers = commonFollows[0].count;
    }
    res.json(rows)
  }catch(error){
    res.status(500).json({ message: "Internal server error: ", error });
  }
}

export {
  getUser,
  getFollowers,
  getFollowing,
  createUser,
  authUser, 
  updateUser,
  getUserData,
  followUser,
  unfollowUser,
  searchUsers,
};
