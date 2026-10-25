const express = require("express")
const { randomUUID } = require("node:crypto")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")

app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Resume files must be 3 MB or smaller." })
    }

    if (error.status === 400) {
        return res.status(400).json({ message: error.message })
    }

    if (error.code === "AI_NOT_CONFIGURED") {
        return res.status(503).json({ message: error.message })
    }

    if (error.code === "AI_PROVIDER_ERROR") {
        const providerStatus = Number(error.providerStatus)
        const status = providerStatus === 429 || providerStatus >= 500 ? 503 : 502
        console.error("AI provider request failed:", {
            status: error.providerStatus,
            code: error.providerCode,
            message: error.cause?.message || error.message
        })
        return res.status(status).json({ message: error.message })
    }

    if (error.code === "AI_INVALID_RESPONSE") {
        console.error("AI provider returned an invalid report:", error.cause?.message || error.message)
        return res.status(502).json({ message: error.message })
    }

    if (error.name === "MulterError" || error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ message: error.message })
    }

    if (error.code === 11000) {
        return res.status(409).json({ message: "An account with that username or email already exists." })
    }

    if (error.status >= 400 && error.status < 500) {
        return res.status(error.status).json({ message: error.message })
    }

    const requestId = randomUUID()
    console.error("Request failed:", {
        requestId,
        method: req.method,
        path: req.originalUrl,
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack
    })
    return res.status(500).json({
        message: "An unexpected server error occurred.",
        requestId
    })
})

module.exports = app