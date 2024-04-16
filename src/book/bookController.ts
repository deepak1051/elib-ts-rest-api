import path from "node:path";
import fs from "node:fs";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import Book from "./bookModel";
import { AuthRequest } from "../middlewares/auth";

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

    const _req = req as AuthRequest;

    const newBook = await Book.create({
      title,
      genre,

      author: _req.userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genre } = req.body;

    const bookId = req.params.bookId;

    const book = await Book.findById(bookId);

    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    //CHECK ACCESS
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, "You can not update this book."));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    let completeCoverImage = "";

    if (files?.coverImage) {
      const fileName = files?.coverImage[0].filename;
      const coverImageMimeType = files?.coverImage[0].mimetype
        .split("/")
        .at(-1);

      const filePath = path.resolve(
        __dirname,
        `../../public/data/uploads`,
        fileName
      );

      completeCoverImage = fileName;

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: completeCoverImage,
        folder: "book-covers",
        format: coverImageMimeType,
      });

      completeCoverImage = uploadResult.secure_url;
      await fs.promises.unlink(filePath);
    }

    let completeFileName = "";
    if (files?.file) {
      const bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        files?.file[0].filename
      );

      completeFileName = files?.file[0].filename;

      const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw",
        filename_override: completeFileName,
        folder: "book-pdfs",
        format: "pdf",
      });

      completeFileName = uploadResultPdf.secure_url;
      await fs.promises.unlink(bookFilePath);
    }

    const updateBook = await Book.findByIdAndUpdate(
      bookId,
      {
        title,
        genre,
        coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
        file: completeFileName ? completeFileName : book.file,
      },
      {
        new: true,
      }
    );

    return res.status(200).json(updateBook);
  } catch (error) {
    return next(createHttpError(500, "Error while updating files."));
  }
};

export { createBook, updateBook };
