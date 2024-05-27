import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

import userRouter from "./routes/user.routes.js";
import employeeRouter from "./routes/employee.routes.js";
import productiveRouter from "./routes/productive.routes.js";

app.use('/api/users', userRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/productive', productiveRouter);

export default app;
