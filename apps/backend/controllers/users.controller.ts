import { prisma } from "@repo/database";
import type { Request, Response } from "express";
import { userSchema } from "@repo/validations";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function signUp(req: Request, res: Response) {
  const { data, error } = userSchema.safeParse(req.body);

  if (error) {
    return res.status(400).json({
      error: "Invalid input",
      details: error.errors.map((err) => err.message),
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return res.status(400).json({ error: "Email already exists" });
  }

  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      data: user.id,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function signIn(req: Request, res: Response) {
  const { data, error } = userSchema.safeParse(req.body);

  if (error) {
    return res.status(400).json({
      error: "Invalid input",
      details: error.errors.map((err) => err.message),
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
      }
    );

    if (!token) {
      return res.status(500).json({ error: "Failed to generate token" });
    }

    return res.status(200).json({
      data: token,
      message: "User signed in successfully",
    });
  } catch (error) {
    console.error("Error signing in user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
