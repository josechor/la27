import sharp from "sharp";
import crypto from "crypto";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { pool } from "../config/database.js";

const upload = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file provided" });
  }

  try {
    const filePath = path.resolve(file.path);
    const fileType = file.mimetype.split("/")[0];
    const fileExtension = path.extname(file.originalname);

    const checksum = crypto
      .createHash("sha256")
      .update(fs.readFileSync(filePath))
      .digest("hex");

    const existingMedia = await findMediaByCheckSum(checksum);
    if (existingMedia) {
      return res.status(200).json({
        message: "File already exists",
        media: existingMedia,
      });
    }
    let processedFilePath;
    if (fileType === "image") {
      processedFilePath = `uploads/${path.basename(
        file.path,
        fileExtension
      )}.webp`;
      await sharp(filePath).webp({ quality: 80 }).toFile(processedFilePath);
    } else if (fileType === "video") {
      processedFilePath = `uploads/${path.basename(
        file.path,
        fileExtension
      )}.mp4`;
      await compressVideo(filePath, processedFilePath);
    } else {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const mediaData = await saveMediaToDatabase({
      filename: path.basename(processedFilePath),
      fileType,
      fileSize: fs.statSync(processedFilePath).size,
      checksum,
    });

    res.status(201).json({
      message: "Archivo procesado y guardado exitosamente",
      media: mediaData,
    });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error("Error processing file", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

function compressVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec("libx264") // Códec eficiente
      .size("1280x720") // Resolución fija (opcional)
      .outputOptions("-crf 20") // Nivel de compresión (menor = más calidad)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
}

async function findMediaByCheckSum(checksum) {
  const query = "SELECT * FROM media WHERE checksum = ? LIMIT 1";
  const [rows] = await pool.query(query, [checksum]);
  return rows.length ? rows[0] : null;
}

async function saveMediaToDatabase(mediaData) {
  const query =
    "INSERT INTO media (file_name, file_type, file_size, checksum) VALUES (?, ?, ?, ?)";
  const { filename, fileType, fileSize, checksum } = mediaData;
  const [result] = await pool.execute(query, [
    filename,
    fileType,
    fileSize,
    checksum,
  ]);

  return result.insertId;
}

export { upload };
