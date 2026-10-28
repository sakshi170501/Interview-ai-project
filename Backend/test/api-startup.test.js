const assert = require("node:assert/strict")
const http = require("node:http")
const Module = require("node:module")
const { test } = require("node:test")

const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
    if (request === "pdf-parse") {
        throw new ReferenceError("PDF parser runtime is unavailable")
    }

    return originalLoad.call(this, request, parent, isMain)
}

let app
try {
    app = require("../src/app")
} finally {
    Module._load = originalLoad
}

test("auth routes start when the PDF parser cannot load", async () => {
    const server = http.createServer(app)
    server.listen(0, "127.0.0.1")
    await new Promise((resolve) => server.once("listening", resolve))

    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        })

        assert.equal(response.status, 400)
        assert.deepEqual(await response.json(), { message: "Please provide email and password" })
    } finally {
        server.closeAllConnections()
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve())
        })
    }
})
