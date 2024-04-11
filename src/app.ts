import express, { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();

app.get("/", (req, res, next) => {
  res.json({ message: "Welcome to elib api" });
});

app.use("/api/users", userRouter);

// Global error handler

app.use(globalErrorHandler);

export default app;
