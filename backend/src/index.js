import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/db.js"

dotenv.config({ path: "./.env" })

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await connectDB()
    console.log("✅ Database connected successfully")

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
