import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "dotenv";
import { AuthenticatedRequest, CustomJwtPayload } from "./types";

env.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET)
    throw new Error("Access token secret is not defined in environment variables");

const AuthenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as CustomJwtPayload;
            req.userId = decoded.userId;
            next();
        } catch(e) {
            res.status(403).json({ message: "Invalid or expired access token" });
        }
    }
    else 
        res.status(401).json({ message: "Authentication required" });
};

export { AuthenticateUser }