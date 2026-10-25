const assert = require("node:assert/strict")
const { test } = require("node:test")
const { PDFParse } = require("pdf-parse")
const generateResumePdf = require("../src/services/pdf.service")

test("creates a readable PDF containing the report profile and target role", async () => {
    const pdf = generateResumePdf({
        title: "Backend Engineer",
        selfDescription: "Backend developer with API design experience.",
        resume: "Built reliable services and improved database performance.",
        matchScore: 82,
        skillGaps: [{ skill: "System design", severity: "medium" }]
    })
    const parser = new PDFParse({ data: pdf })

    try {
        assert.equal(pdf.subarray(0, 8).toString("ascii"), "%PDF-1.4")
        const result = await parser.getText()
        assert.match(result.text, /Backend Engineer/)
        assert.match(result.text, /API design experience/)
        assert.match(result.text, /System design/)
    } finally {
        await parser.destroy()
    }
})

test("splits long resume content across PDF pages", () => {
    const pdf = generateResumePdf({
        title: "Software Engineer",
        selfDescription: "Experienced developer.",
        resume: "Project experience. ".repeat(1200),
        matchScore: 70,
        skillGaps: []
    })

    assert.ok((pdf.toString("ascii").match(/\/Type \/Page\b/g) || []).length > 1)
})
