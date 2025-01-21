import { getConnection } from "../models/tuipModels.js";
import {
  findUserByUsername,
  getFollowersCount,
  getFollowingCount,
  getTuipsCount,
  getLikesCount,
  checkIfFollowing,
  updateProfilePictureModel,
  updateBannerModel,
} from "../models/userModel.js";
import { processFile } from "./mediaService.js";

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

export const updateProfilePictureService = async ({
  userId,
  profilePicture,
}) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    const mediaData = await processFile(profilePicture);
    await updateProfilePictureModel(
      connection,
      userId,
      mediaData.media.filename
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateBannerService = async ({
  userId,
  banner,
}) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    const mediaData = await processFile(banner);
    console.log(mediaData);
    await updateBannerModel(connection, userId, mediaData.media.filename);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
