import path from "node:path";
import express from "express";
import {
  createBook,
  getSingleBook,
  listBooks,
  updateBook,
} from "./bookController";
import multer from "multer";
import auth from "../middlewares/auth";

const router = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 }, //30mb
});

//routes
router.post(
  "/",
  auth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

router.patch(
  "/:bookId",
  auth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

router.get("/", listBooks);

router.get("/:bookId", getSingleBook);

export default router;
