import 'dotenv/config';
import express from "express";
import userRoutes from "./routes/user.routes";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logger } from "@repo/backend-common/config";

const app = express();

const PORT = process.env.PORT || 5050;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));

// CORS configuration
app.use(cors({
    credentials: true,
    origin: FRONTEND_URL, // Support multiple origins
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


// Start server
app.listen(PORT, () => {
    logger.info(`HTTP server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});