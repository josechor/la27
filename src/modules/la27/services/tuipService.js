import {
  getConnection,
  insertTuip,
  insertTuipMedia,
} from "../models/tuipModels.js";
import { processFile } from "./mediaService.js";

export const createTuipService = async ({
  demonId,
  content,
  parent,
  quoting,
  secta,
  files,
}) => {
  const connection = await getConnection();

  try {
    console.log("0");
    await connection.beginTransaction();
    console.log("1");

    const tuipId = await insertTuip(connection, {
      demonId,
      content,
      parent,
      quoting,
      secta,
    });
    console.log("2");

    for (const file of files) {
      console.log(file);
      const mediaData = await processFile(file);
      console.log(mediaData.media.id);
      await insertTuipMedia(connection, tuipId, mediaData.media.id);
    }

    await connection.commit();
    return { id: tuipId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
