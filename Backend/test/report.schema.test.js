const assert = require("node:assert/strict")
const { test } = require("node:test")
const { createGeminiResponseSchema, interviewReportSchema } = require("../src/services/report.schema")

test("converts the report shape into a populated Gemini JSON schema", () => {
    const schema = createGeminiResponseSchema()

    assert.equal(schema.type, "object")
    assert.deepEqual(schema.required, [
        "title",
        "matchScore",
        "technicalQuestions",
        "behaviouralQuestions",
        "skillGaps",
        "preparationPlan"
    ])
    assert.equal(schema.properties.technicalQuestions.type, "array")
    assert.equal(schema.properties.technicalQuestions.items.properties.question.type, "string")
    assert.equal(schema.properties.skillGaps.items.properties.severity.enum.join(","), "low,medium,high")
    assert.equal(JSON.stringify(schema).includes('"additionalProperties"'), false)
    assert.equal(JSON.stringify(schema).includes('"$schema"'), false)
})

test("validates complete report output and rejects invalid output", () => {
    const report = {
        title: "Backend Engineer",
        matchScore: 82,
        technicalQuestions: [{ question: "How do you design an API?", intention: "Assess design", answer: "Explain tradeoffs." }],
        behaviouralQuestions: [{ question: "Describe a challenge.", intention: "Assess collaboration", answer: "Use STAR." }],
        skillGaps: [{ skill: "System design", severity: "medium" }],
        preparationPlan: [{ day: 1, focus: "API design", tasks: ["Review REST principles"] }]
    }

    assert.deepEqual(interviewReportSchema.parse(report), report)
    assert.throws(() => interviewReportSchema.parse({ ...report, technicalQuestions: [] }))
})
