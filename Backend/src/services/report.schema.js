const { z } = require("zod")

const interviewReportSchema = z.object({
    title: z.string().min(1).describe("The job title for the interview report"),
    matchScore: z.number().min(0).max(100).describe("Match score between 0 and 100"),
    technicalQuestions: z.array(z.object({
        question: z.string().min(1).describe("Detailed technical interview question"),
        intention: z.string().min(1).describe("The interviewer's intention behind the question"),
        answer: z.string().min(1).describe("Guidance on how to answer the question")
    })).min(1).describe("List of technical questions"),
    behaviouralQuestions: z.array(z.object({
        question: z.string().min(1).describe("Detailed behavioral interview question"),
        intention: z.string().min(1).describe("The interviewer's intention behind the question"),
        answer: z.string().min(1).describe("Guidance on how to answer using the STAR method")
    })).min(1).describe("List of behavioral questions"),
    skillGaps: z.array(z.object({
        skill: z.string().min(1).describe("Specific skill the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("Severity level of the gap")
    })).min(1).describe("List of skill gaps"),
    preparationPlan: z.array(z.object({
        day: z.number().int().min(1).max(365).describe("Day number starting from 1"),
        focus: z.string().min(1).describe("Main focus area for the day"),
        tasks: z.array(z.string().min(1)).min(1).describe("List of specific tasks to complete")
    })).min(1).describe("Day-wise preparation plan")
})

function removeUnsupportedSchemaKeywords(schema) {
    if (Array.isArray(schema)) {
        return schema.map(removeUnsupportedSchemaKeywords)
    }
    if (!schema || typeof schema !== "object") {
        return schema
    }

    return Object.fromEntries(
        Object.entries(schema)
            .filter(([key]) => key !== "$schema" && key !== "additionalProperties")
            .map(([key, value]) => [key, removeUnsupportedSchemaKeywords(value)])
    )
}

function createGeminiResponseSchema() {
    const schema = z.toJSONSchema(interviewReportSchema, { target: "openapi-3.0" })
    return removeUnsupportedSchemaKeywords(schema)
}

module.exports = { interviewReportSchema, createGeminiResponseSchema }
