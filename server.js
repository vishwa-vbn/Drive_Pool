const multer = require('multer');
const { google } = require('googleapis');
const { Readable } = require('stream');

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;

    const fileMetadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const media = {
      mimeType: mimeType,
      body: Readable.from(fileBuffer),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log("response", response);
    const fileId = response.data.id;

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const fileUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    res.json({ url: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error uploading file' });
  }
});
