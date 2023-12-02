const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});


const upload = multer({ storage: storage });

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server running Successfully!" });
});

app.post("/send-email", upload.array("files"), async (req, res) => {
  try {
    const { text, receiverEmail } = req.body;

    const attachmentPaths = req.files ? req.files.map((file) => file.path) : [];

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: receiverEmail,
      subject: "New Form Submission",
      text: text,
      attachments: attachmentPaths.map((path) => ({ path })),
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Email sent Successfully",
      response: info.response,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: "Error Occurred during sending Email",
      error: error.toString(),
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
