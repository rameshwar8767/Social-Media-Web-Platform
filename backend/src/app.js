import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  })
)

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

// router imports

// Root
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working 🚀"
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err)

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  })
})




export default app;