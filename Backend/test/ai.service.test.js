const assert = require("node:assert/strict")
const Module = require("node:module")
const path = require("node:path")
const { test } = require("node:test")

const calls = []
const responses = []

class FakeGoogleGenAI {
    constructor() {
        this.models = {
            generateContent: async (request) => {
                calls.push(request)
                const next = responses.shift()
                if (next instanceof Error) {
                    throw next
                }
                return next
            }
        }
    }
}

const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
    if (request === "@google/genai") {
        return { GoogleGenAI: FakeGoogleGenAI }
    }
    return originalLoad.call(this, request, parent, isMain)
}

const servicePath = path.resolve(__dirname, "../src/services/ai.service.js")
let generateInterviewReport
try {
    generateInterviewReport = require(servicePath)
} finally {
    Module._load = originalLoad
}

const validReport = {
    title: "Backend Engineer",
    matchScore: 82,
    technicalQuestions: [{ question: "How do you design an API?", intention: "Assess design", answer: "Explain tradeoffs." }],
    behaviouralQuestions: [{ question: "Describe a challenge.", intention: "Assess collaboration", answer: "Use STAR." }],
    skillGaps: [{ skill: "System design", severity: "medium" }],
    preparationPlan: [{ day: 1, focus: "API design", tasks: ["Review REST principles"] }]
}

function providerError(status, message) {
    const error = new Error(JSON.stringify({ error: { code: status, message } }))
    error.status = status
    return error
}

test("retries a transient primary-model 503 with the Gemini fallback model", async () => {
    const previousKey = process.env.GOOGLE_GENAI_API_KEY
    const previousModel = process.env.GOOGLE_GENAI_MODEL
    process.env.GOOGLE_GENAI_API_KEY = "test-key"
    delete process.env.GOOGLE_GENAI_MODEL
    calls.length = 0
    responses.push(providerError(503, "Primary model temporarily unavailable"), { parsed: validReport })

    try {
        const report = await generateInterviewReport({
            resume: "",
            selfDescription: "Backend developer",
            jobDescription: "Backend Engineer"
        })

        assert.deepEqual(report, validReport)
        assert.deepEqual(calls.map((call) => call.model), ["gemini-3.8-flash", "gemini-3.6-flash"])
        assert.equal(calls[0].config.responseMimeType, "application/json")
        assert.ok(calls[0].config.responseJsonSchema)
    } finally {
        if (previousKey === undefined) delete process.env.GOOGLE_GENAI_API_KEY
        else process.env.GOOGLE_GENAI_API_KEY = previousKey
        if (previousModel === undefined) delete process.env.GOOGLE_GENAI_MODEL
        else process.env.GOOGLE_GENAI_MODEL = previousModel
    }
})

test("does not retry non-transient Gemini errors and preserves provider details", async () => {
    const previousKey = process.env.GOOGLE_GENAI_API_KEY
    process.env.GOOGLE_GENAI_API_KEY = "test-key"
    calls.length = 0
    responses.push(providerError(400, "Invalid request"))

    try {
        await assert.rejects(
            generateInterviewReport({
                resume: "",
                selfDescription: "Backend developer",
                jobDescription: "Backend Engineer"
            }),
            (error) => {
                assert.equal(error.code, "AI_PROVIDER_ERROR")
                assert.equal(error.providerStatus, 400)
                assert.equal(error.providerMessage, "Invalid request")
                assert.equal(error.providerModel, "gemini-3.8-flash")
                return true
            }
        )
        assert.equal(calls.length, 1)
    } finally {
        if (previousKey === undefined) delete process.env.GOOGLE_GENAI_API_KEY
        else process.env.GOOGLE_GENAI_API_KEY = previousKey
    }
})

test("preserves fallback-model provider details when both models return 503", async () => {
    const previousKey = process.env.GOOGLE_GENAI_API_KEY
    process.env.GOOGLE_GENAI_API_KEY = "test-key"
    calls.length = 0
    responses.push(
        providerError(503, "Primary model unavailable"),
        providerError(503, "Fallback model unavailable")
    )

    try {
        await assert.rejects(
            generateInterviewReport({
                resume: "",
                selfDescription: "Backend developer",
                jobDescription: "Backend Engineer"
            }),
            (error) => {
                assert.equal(error.providerStatus, 503)
                assert.equal(error.providerModel, "gemini-3.6-flash")
                assert.equal(error.providerMessage, "Fallback model unavailable")
                return true
            }
        )
        assert.deepEqual(calls.map((call) => call.model), ["gemini-3.8-flash", "gemini-3.6-flash"])
    } finally {
        if (previousKey === undefined) delete process.env.GOOGLE_GENAI_API_KEY
        else process.env.GOOGLE_GENAI_API_KEY = previousKey
    }
})
