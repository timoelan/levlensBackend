const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const PORT = 3000;

// Speicherort und Namensschema für hochgeladene Dateien
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = req.body.folderName;
    const uploadPath = path.join(__dirname, 'images', folderName);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Temporärer Name, wird später überschrieben
  },
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname)));

// Upload-Route
app.post('/upload', upload.array('images'), async (req, res) => {
  const folderName = req.body.folderName;
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded');
  }

  const uploadPath = path.join(__dirname, 'images', folderName);
  const resizedImages = [];

  try {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const newFileName = `${folderName}-${i + 1}.jpg`;
      const newFilePath = path.join(uploadPath, newFileName);

      // Verkleinere das Bild und reduziere die Dateigröße
      await sharp(file.path)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toFile(newFilePath);

      fs.unlinkSync(file.path); // Lösche das Original
      resizedImages.push(newFileName);
    }

    res.status(200).json({
      message: 'Files uploaded and resized successfully',
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