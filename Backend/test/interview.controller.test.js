const assert = require("node:assert/strict")
const path = require("node:path")
const { test } = require("node:test")

const servicePath = path.resolve(__dirname, "../src/services/ai.service.js")
const modelPath = path.resolve(__dirname, "../src/models/interviewReport.model.js")
let createdReport

require.cache[servicePath] = {
    id: servicePath,
    filename: servicePath,
    loaded: true,
    exports: async () => ({
        title: "Backend Engineer",
        matchScore: 80,
        technicalQuestions: [{ question: "Q", intention: "I", answer: "A" }],
        behaviouralQuestions: [{ question: "Q", intention: "I", answer: "A" }],
        skillGaps: [{ skill: "Testing", severity: "low" }],
        preparationPlan: [{ day: 1, focus: "Testing", tasks: ["Write tests"] }]
    })
}

require.cache[modelPath] = {
    id: modelPath,
    filename: modelPath,
    loaded: true,
    exports: {
        create: async (report) => {
            createdReport = report
            return { _id: "report-id", ...report }
        }
    }
}

const { generateInterViewReportController } = require("../src/controllers/interview.controller")

test("creates a report from a self-description without referencing an absent uploaded resume", async () => {
    let statusCode
    let responseBody
    const response = {
        status(code) {
            statusCode = code
            return this
        },
        json(body) {
            responseBody = body
            return this
        }
    }

    await generateInterViewReportController({
        body: {
            selfDescription: "Backend developer with API experience",
            jobDescription: "Backend Engineer"
        },
        user: { id: "user-id" }
    }, response)

    assert.equal(statusCode, 201)
    assert.equal(createdReport.resume, "")
    assert.equal(createdReport.selfDescription, "Backend developer with API experience")
    assert.equal(responseBody.interviewReport._id, "report-id")
})
