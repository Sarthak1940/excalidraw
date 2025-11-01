import { NextFunction, Response, Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET, logger } from "@repo/backend-common/config";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.userId = decoded.id;
        next();
    } catch (error) {
        logger.warn('Authentication failed', { error });
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
}