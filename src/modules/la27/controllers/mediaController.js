import { processFile } from "../services/mediaService.js";

const upload = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "No file provided" });
  }

  try {
    const { alreadyExists, media } = await processFile(file);

    if (alreadyExists) {
      return res.status(200).json({
        message: "File already exists",
        media,
      });
    }

    res.status(201).json({
      message: "File processed and saved successfully",
      media,
    });
  } catch (e) {
    console.error("Error processing file", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { upload };
