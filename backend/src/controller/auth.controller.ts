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
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "User already exist",
      });
    }

    const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must contain uppercase, lowercase, number and special character",
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

    return res.status(HTTP_STATUS.CREATED).json({
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Me: ',error);
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

    const user = await User.findOne({ email }).select('+password')

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
        token,
      },
    });
    
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
    
  }
}

export { register, login };
