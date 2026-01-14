import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/db.js"

dotenv.config({ path: "./.env" })

// Connect DB once (Vercel supports this)
await connectDB()
console.log("✅ Database connected")

export default app
