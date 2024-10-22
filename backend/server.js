import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import connectDB from "./db/connectDB.js"

import userRoutes from "./routes/user.route.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use("/api/users", userRoutes)

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
    connectDB();
})