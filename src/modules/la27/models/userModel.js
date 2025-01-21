import { pool } from "../../../config/database.js";

export const findUserByUsername = async (username) => {
  const [userdata] = await pool.query(
    `SELECT id as userId, user_name as userName, demon_name as demonName, email, 
     profile_picture as profilePicture, banner, description, 
     pinned_tuip_id as pinnedTuipId, created_at as createdAt, birthday 
     FROM demons WHERE user_name = ?`,
    [username]
  );
  return userdata;
};

export const getFollowersCount = async (userId) => {
  const [followers] = await pool.query(
    "SELECT COUNT(*) as followers FROM followers WHERE followed_id = ?",
    [userId]
  );
  return followers;
};

export const getFollowingCount = async (userId) => {
  const [following] = await pool.query(
    "SELECT COUNT(*) as following FROM followers WHERE follower_id = ?",
    [userId]
  );
  return following;
};

export const getTuipsCount = async (userId) => {
  const [tuips] = await pool.query(
    "SELECT COUNT(*) as tuipsCount FROM tuips WHERE demon_id = ?",
    [userId]
  );
  return tuips;
};

export const getLikesCount = async (userId) => {
  const [likes] = await pool.query(
    "SELECT COUNT(*) as likesCount FROM likes WHERE demon_id = ?",
    [userId]
  );
  return likes;
};

export const checkIfFollowing = async (followerId, followedId) => {
  const [result] = await pool.query(
    "SELECT follower_id FROM followers WHERE follower_id = ? AND followed_id = ?",
    [followerId, followedId]
  );
  return result.length > 0;
};

export const getFollowersModel = async (useName) => {
  const [followers] = await pool.query(
    "SELECT d.demon_name, d.user_name FROM demons d JOIN followers f ON d.id = f.follower_id  WHERE f.followed_id = (SELECT id FROM demons WHERE user_name = ?)",
    [useName]
  );
  return followers;
};

export const getFollowingModel = async (useName) => {
  const [rows] = await pool.query(
    "SELECT d.demon_name, d.user_name FROM demons d JOIN followers f ON d.id = f.followed_id  WHERE f.follower_id = (SELECT id FROM demons WHERE user_name = ?)",
    [useName]
  );
  return rows;
};

export const updateProfilePictureModel = async (
  connection,
  userId,
  profilePicture
) => {
  const query = "UPDATE demons SET profile_picture = ? WHERE id = ?";
  await connection.query(query, [profilePicture, userId]);
};

export const updateBannerModel = async (connection, userId, banner) => {
  const query = "UPDATE demons SET banner = ? WHERE id = ?";
  await connection.query(query, [banner, userId]);
};
