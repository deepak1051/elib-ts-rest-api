import express, { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";

const app = express();

app.use(express.json());

app.get("/", (req, res, next) => {
  res.json({ message: "Welcome to elib api" });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

// Global error handler

app.use(globalErrorHandler);

export default app;
