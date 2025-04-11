const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const PORT = 3000;

const DB_PATH = path.join(__dirname, '../api/db.json'); // Pfad zur db.json

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = req.body.folderName;
    const uploadPath = path.join(__dirname, 'images', folderName);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname)));
app.use(express.json()); // Middleware für JSON-Parsing

app.post('/upload', upload.array('images'), async (req, res) => {
  const folderName = req.body.folderName;
  const title = req.body.title || folderName; // Optionaler Titel
  const description = req.body.description || 'No description provided'; // Optionale Beschreibung

  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded');
  }

  const uploadPath = path.join(__dirname, 'images', folderName);
  const resizedImages = [];
  const additionalImages = [];

  try {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const newFileName = `${folderName}-${i + 1}.jpg`;
      const newFilePath = path.join(uploadPath, newFileName);

      await sharp(file.path)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toFile(newFilePath);

      fs.unlinkSync(file.path);

      resizedImages.push({ fileName: newFileName });
      additionalImages.push(`/images/${folderName}/${newFileName}`);
    }

    // Aktualisiere db.json
    const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    dbData.push({
      src: additionalImages[0], // Erstes Bild als Hauptbild
      title,
      description,
      additionalImages,
    });
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));

    res.status(200).json({
      message: 'Files uploaded, resized, renamed, and added to db.json successfully',
      files: resizedImages,
    });
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).send('Error processing images');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});