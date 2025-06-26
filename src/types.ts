import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    userId: number,
}

interface CustomJwtPayload extends JwtPayload {
    userId: number,
}

export type { AuthenticatedRequest, CustomJwtPayload, }