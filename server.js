require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); 
const axios = require('axios'); 
const { Console } = require('console');

const app = express();
app.use(cors()); 
const upload = multer({ dest: 'uploads/' });

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);

    const fileMetadata = {
      name: req.file.originalname,
      mimeType: req.file.mimetype,
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });


     console.log("response",response)
    const fileId = response.data.id;

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const fileUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    fs.unlinkSync(filePath);

    res.json({ url: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error uploading file' });
  }
});




app.listen(5000, () => console.log('Server started on port 5000'));
