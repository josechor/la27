import {
  findUserByUsername,
  getFollowersCount,
  getFollowingCount,
  getTuipsCount,
  getLikesCount,
  checkIfFollowing,
} from "../models/userModel.js";

export const getUserData = async (username, userId) => {
  const user = await findUserByUsername(username);

  if (user.length === 0) {
    throw new Error("User not found");
  }

  const followers = await getFollowersCount(user[0].userId);
  const following = await getFollowingCount(user[0].userId);
  const tuips = await getTuipsCount(user[0].userId);
  const likes = await getLikesCount(user[0].userId);
  const isFollowing = await checkIfFollowing(userId, user[0].userId);

  return {
    ...user[0],
    ...followers[0],
    ...following[0],
    ...tuips[0],
    ...likes[0],
    followed: isFollowing,
  };
};
