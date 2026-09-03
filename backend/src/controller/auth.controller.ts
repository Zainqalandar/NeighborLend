import { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "All fileds are required",
      });
    }

    const existingUser = await User.findOne(email);

    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "User already exist",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      address,
      password: hashed,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    console.log("Email token: ", token);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

const login = async (req: Request, res: Response ) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
			return res.status(HTTP_STATUS.BAD_REQUEST).json({
				message: 'Email & password required',
			});
		}

    const user = await User.findOne(email).select('+password')

    if(!user){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Invalid credentials'
      })
    };

    const isMatch = await bcrypt.compare(password, user.password);

    

    if (!isMatch) {
			return res.status(400).json({
				message: 'Invalid credentials',
			});
		}
    
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
    
  }
}

export { register, login };
