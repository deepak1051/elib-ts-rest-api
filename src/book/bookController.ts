import path from "node:path";
import fs from "node:fs";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import Book from "./bookModel";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  // console.log("files", req.files);

  const { title, genre } = req.body;

  if (!title || !genre) {
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const coverImageMimeType = files?.coverImage[0].mimetype.split("/").at(-1);

    const fileName = files?.coverImage[0].filename;

    const filePath = path.resolve(
      __dirname,
      `../../public/data/uploads`,
      fileName
    );

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFileName = files?.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    const newBook = await Book.create({
      title,
      genre,

      author: "6617d74b64c2a500af3801ef",
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);

    res.status(201).json({ id: newBook._id });
  } catch (error) {
    return next(createHttpError(500, "Error while uploading files."));
  }
};

export { createBook };
