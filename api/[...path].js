const dns = require("node:dns")
const { randomUUID } = require("node:crypto")

if (!process.env.VERCEL) {
    const dnsServers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,8.8.4.4")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean)

    dns.setServers(dnsServers)
}

const app = require("../Backend/src/app")
const connectToDB = require("../Backend/src/config/database")

module.exports = async function handler(req, res) {
    if (req.url?.split("?")[0] === "/api/health") {
        return app(req, res)
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET must be configured in Vercel project settings." })
    }

    try {
        await connectToDB()
    } catch (error) {
        const requestId = randomUUID()
        console.error("Database connection failed:", {
            requestId,
            name: error.name,
            code: error.code,
            message: error.message
        })
        return res.status(503).json({
            message: "The database is temporarily unavailable. Check the server logs and try again.",
            requestId
        })
    }

    return app(req, res)
}
