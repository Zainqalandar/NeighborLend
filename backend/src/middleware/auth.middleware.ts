
import { Request, Response, NextFunction } from "express";
const jwt = require('jsonwebtoken');

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, 'process.env.JWT_SECRET' as string) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;