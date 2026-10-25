const assert = require("node:assert/strict")
const { test } = require("node:test")
const app = require("../src/app")

test("health endpoint returns an API status without a database connection", async () => {
    const server = app.listen(0)
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

test("protected routes reject requests without a session cookie", async () => {
    const server = app.listen(0)
    await new Promise((resolve) => server.once("listening", resolve))

    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/get-me`)
        assert.equal(response.status, 401)
        assert.deepEqual(await response.json(), { message: "token not provided" })
    } finally {
        server.closeAllConnections()
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve())
        })
    }
})
