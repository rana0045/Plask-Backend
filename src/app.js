import express from "express";
import cors from "cors";
import CookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.ORIGIN
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(CookieParser())


// Routes import
import userRouter from "./routes/user.routes.js";
import employeeRouter from "./routes/employee.routes.js";
//route declare
app.use('/api/users', userRouter)
app.use('/api/employee', employeeRouter)
export default app
