import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import User from "./userModel";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }

  //Database call
  const user = await User.findOne({ email });

  if (user) {
    return next(createHttpError(400, "User already exists"));
  }

  //process

  //response

  res.json({ message: "create user" });
};

export { createUser };
