import express from "express";
import userRoutes from "./routes/user.routes";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]
}));
app.use(cookieParser());

app.use("/api/v1/user", userRoutes);

app.listen(5050);