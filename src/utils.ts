import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET)
    throw new Error("Access token secret is not defined in environment variables");

const AuthenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;
  
    if (accessToken) {
        try {
            jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
            next();
        } catch(e) {
            res.status(403).json({ message: "Invalid or expired access token" });
        }
    }
    else 
        res.status(401).json({ message: "Authentication required" });
};

export { AuthenticateToken }