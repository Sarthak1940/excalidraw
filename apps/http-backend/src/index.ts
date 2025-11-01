import 'dotenv/config';
import express from "express";
import userRoutes from "./routes/user.routes";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logger } from "@repo/backend-common/config";

const app = express();

const PORT = process.env.PORT || 5050;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));

// CORS configuration
app.use(cors({
    credentials: true,
    origin: FRONTEND_URL.split(','), // Support multiple origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/v1/user", userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error', err);
    res.status(err.status || 500).json({ 
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`HTTP server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});