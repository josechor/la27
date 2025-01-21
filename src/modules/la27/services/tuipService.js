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
    await connection.beginTransaction();

    const tuipId = await insertTuip(connection, {
      demonId,
      content,
      parent,
      quoting,
      secta,
    });

    for (const file of files) {
      const mediaData = await processFile(file);
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
