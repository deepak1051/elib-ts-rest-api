import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "./userModel";
import { config } from "../config/config";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }
  try {
    //Database call
    const user = await User.findOne({ email });

    if (user) {
      return next(createHttpError(400, "User already exists"));
    }

    //password hash
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
    });

    //Token generate JWT

    const token = jwt.sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    //response

    res.json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Internal Server Error"));
  }
};

export { createUser };
