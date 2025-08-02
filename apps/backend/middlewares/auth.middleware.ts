import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

    req.user = decodedToken as CustomUser;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
