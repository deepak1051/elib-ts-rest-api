import express, { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";

import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();

app.get("/", (req, res, next) => {
  // throw new Error("test error");

  const error = createHttpError(400, "something went wrong");

  throw error;

  res.json({ message: "Welcome to elib api" });
});

// Global error handler

app.use(globalErrorHandler);

export default app;
