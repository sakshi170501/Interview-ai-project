const assert = require("node:assert/strict")
const http = require("node:http")
const { test } = require("node:test")
const handler = require("../../api/[...path].js")
const authHandler = require("../../api/auth/[...path].js")
const interviewHandler = require("../../api/interview/[...path].js")
const reportHandler = require("../../api/interview/report/[interviewId].js")
const resumePdfHandler = require("../../api/interview/resume/pdf/[interviewReportId].js")

async function requestHandler(requestHandler, path, options = {}) {
    const server = http.createServer((req, res) => {
        res.status = (status) => {
            res.statusCode = status
            return res
        }
        res.json = (body) => {
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify(body))
        }
        return requestHandler(req, res)
    })
    server.listen(0, "127.0.0.1")
    await new Promise((resolve) => server.once("listening", resolve))

    try {
        return await fetch(`http://127.0.0.1:${server.address().port}${path}`, options)
    } finally {
        server.closeAllConnections()
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve())
        })
    }
}

test("Vercel API handler serves the health check without a database connection", async () => {
    const response = await requestHandler(handler, "/api/health")
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: "ok" })
})

test("nested Vercel auth routes forward registration requests to the API handler", async () => {
    const previousSecret = process.env.JWT_SECRET
    process.env.JWT_SECRET = ""

    try {
        const response = await requestHandler(authHandler, "/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "test-user", email: "test@example.com", password: "password123" })
        })
        assert.equal(response.status, 500)
        assert.match((await response.json()).message, /JWT_SECRET/)
    } finally {
        if (previousSecret === undefined) {
            delete process.env.JWT_SECRET
        } else {
            process.env.JWT_SECRET = previousSecret
        }
    }
})

test("nested Vercel interview routes forward requests to the API handler", async () => {
    const previousSecret = process.env.JWT_SECRET
    process.env.JWT_SECRET = ""

    try {
        const response = await requestHandler(interviewHandler, "/api/interview/report/example-id")
        assert.equal(response.status, 500)
        assert.match((await response.json()).message, /JWT_SECRET/)
    } finally {
        if (previousSecret === undefined) {
            delete process.env.JWT_SECRET
        } else {
            process.env.JWT_SECRET = previousSecret
        }
    }
})

test("explicit Vercel report route forwards requests to the API handler", async () => {
    const previousSecret = process.env.JWT_SECRET
    process.env.JWT_SECRET = ""

    try {
        const response = await requestHandler(reportHandler, "/api/interview/report/0123456789abcdef01234567")
        assert.equal(response.status, 500)
        assert.match((await response.json()).message, /JWT_SECRET/)
    } finally {
        if (previousSecret === undefined) {
            delete process.env.JWT_SECRET
        } else {
            process.env.JWT_SECRET = previousSecret
        }
    }
})

test("explicit Vercel resume PDF route forwards requests to the API handler", async () => {
    const previousSecret = process.env.JWT_SECRET
    process.env.JWT_SECRET = ""

    try {
        const response = await requestHandler(resumePdfHandler, "/api/interview/resume/pdf/0123456789abcdef01234567", {
            method: "POST"
        })
        assert.equal(response.status, 500)
        assert.match((await response.json()).message, /JWT_SECRET/)
    } finally {
        if (previousSecret === undefined) {
            delete process.env.JWT_SECRET
        } else {
            process.env.JWT_SECRET = previousSecret
        }
    }
})
