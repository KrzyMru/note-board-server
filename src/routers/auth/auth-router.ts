import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import env from "dotenv";
import { CustomJwtPayload } from "../../types";
import { AuthBody, DatabaseUser, User } from "./types";

const router = require("express").Router();

env.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET)
    throw new Error("Token secret is not defined in environment variables");
if (!SUPABASE_URL || !SUPABASE_KEY)
    throw new Error("Supabase connection is not defined in environment variables");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

router.post("/auth/sign-up", async (req: Request, res: Response) => {
    const { email, password } = req.body as AuthBody;

    if(ValidateFields(email, password)) {
        const { data } = await supabase
            .from("user")
            .select("*")
            .eq("email", email);

        if(data && data.length === 0) {
            const newUser: User = {
                email: email,
                password: password,
            };
            await supabase
                .from("user")
                .insert(newUser);
            
            res.status(200).json({ message: "Account registered successfully" });
        } 
        else
            res.status(400).json({ message: "User with this email already exists" });
    }
    else 
        res.status(400).json({ message: "Invalid email or password format" });
});

router.post("/auth/sign-in", async (req: Request, res: Response) => {
    const { email, password } = req.body as AuthBody;
  
    if(ValidateFields(email, password)) {
        const { data, error } = await supabase
            .from("user")
            .select("*")
            .eq("email", email)
            .single();

        const user: DatabaseUser = data;
        if(!error && user.email === email && user.password === password) {
            const accessToken = jwt.sign(
                { userId: user.id },
                ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );
            const refreshToken = jwt.sign(
                { userId: user.id },
                REFRESH_TOKEN_SECRET,
                { expiresIn: "7d" }
            );

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' ? true : false,
                sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' ? true : false,
                sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
                path: "/auth/refresh",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(200).json({ message: "Login successful" });
        }
        else
            res.status(401).json({ message: "Invalid credentials" });
    }
    else 
        res.status(400).json({ message: "Invalid email or password format" });
});

router.post("/auth/sign-out", (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/auth/refresh" });
  
    res.status(200).json({ message: "Logged out successfully" });
});

router.post("/auth/refresh", (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as CustomJwtPayload;
            
            const accessToken = jwt.sign(
                { userId: decoded.userId },
                ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' ? true : false,
                sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            res.status(200).json({ message: "Token refreshed successfully" });
        } catch (e) {
            res.clearCookie("refreshToken", { path: "/auth/refresh" });
            res.status(401).json({ message: "Invalid refresh token" })
        }
    }
    else
        res.status(401).json({ message: "Refresh token required" });
});

const ValidateFields = (email: string, password: string) => {
    if(email.length === 0 || password.length === 0)
        return false;
    if(!email.includes('@') || !email.includes('.'))
        return false;

    return true;
}

export default router;