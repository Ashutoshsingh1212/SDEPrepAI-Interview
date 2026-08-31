import express from "express";
import multer from "multer";
import { uploadResume } from "../controllers/resumeController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => cb(null, file.mimetype === "application/pdf")
});

router.post("/upload", upload.single("resume"), uploadResume);

export default router;