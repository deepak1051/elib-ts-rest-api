import express from "express";
import { createBook } from "./bookController";

const router = express.Router();

//routes
router.post("/", createBook);

export default router;
