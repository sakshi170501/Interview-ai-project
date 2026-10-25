const assert = require("node:assert/strict")
const http = require("node:http")
const { test } = require("node:test")
const handler = require("../../api/[...path].js")

test("Vercel API handler serves the health check without a database connection", async () => {
    const server = http.createServer(handler)
    server.listen(0, "127.0.0.1")
    await new Promise((resolve) => server.once("listening", resolve))

    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`)
        assert.equal(response.status, 200)
        assert.deepEqual(await response.json(), { status: "ok" })
    } finally {
        server.closeAllConnections()
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve())
        })
    }
})
