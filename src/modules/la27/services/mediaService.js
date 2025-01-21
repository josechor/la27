import sharp from "sharp";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  findMediaByChecksum,
  saveMediaToDatabase,
} from "../models/mediaModel.js";

function generateChecksum(filePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

async function processImage(filePath, fileExtension) {
  const processedFilePath = `uploads/${path.basename(
    filePath,
    fileExtension
  )}.webp`;
  await sharp(filePath).webp({ quality: 80 }).toFile(processedFilePath);
  return processedFilePath;
}

async function processFile(file) {
  const filePath = path.resolve(file.path);
  const fileType = file.mimetype.split("/")[0];
  const fileExtension = path.extname(file.originalname);

  const checksum = generateChecksum(filePath);

  const existingMedia = await findMediaByChecksum(checksum);
  if (existingMedia) {
    fs.unlinkSync(filePath);
    return { alreadyExists: true, media: existingMedia };
  }

  let processedFilePath;
  if (fileType === "image") {
    processedFilePath = await processImage(filePath, fileExtension);
  } else if (fileType === "video") {
    processedFilePath = filePath;
  } else {
    throw new Error("Invalid file type");
  }

  const mediaData = await saveMediaToDatabase({
    filename: path.basename(processedFilePath),
    fileType,
    fileSize: fs.statSync(processedFilePath).size,
    checksum,
  });

  if (fileType === "image") {
    fs.unlinkSync(filePath);
  }

  return { alreadyExists: false, media: mediaData };
}

export { processFile };
