require("dotenv").config()
const dns = require("node:dns")

const dnsServers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,8.8.4.4")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean)

dns.setServers(dnsServers)

const app = require("./src/app")
const connectToDB = require("./src/config/database")

const port = Number(process.env.PORT) || 3000

async function startServer() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be configured.")
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET must be configured.")
    }

    await connectToDB()
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}

startServer().catch((error) => {
    console.error("Unable to start the server:", error.message)
    process.exitCode = 1
})
