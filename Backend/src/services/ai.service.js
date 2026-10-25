const { GoogleGenAI } = require("@google/genai");
const { interviewReportSchema, createGeminiResponseSchema } = require("./report.schema")

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
        const error = new Error("GOOGLE_GENAI_API_KEY must be configured to generate interview reports.")
        error.code = "AI_NOT_CONFIGURED"
        throw error
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
    const prompt = `You are an expert technical interviewer and career coach. Analyze the candidate details and generate a professional, highly detailed interview report.

CRITICAL INSTRUCTIONS:
- Generate realistic, professional interview questions, skill gaps, and a preparation plan. Do not use placeholder values.
- Fill all fields thoroughly based on the provided resume and job description.
- Use the actual job title from the job description when possible.

Resume: 
${resume}

Self Description: 
${selfDescription}

Job Description: 
${jobDescription}`;

    const jsonSchema = createGeminiResponseSchema()

    let response
    try {
        response = await ai.models.generateContent({
            model: process.env.GOOGLE_GENAI_MODEL || "gemini-3.8-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: jsonSchema,
            }
        })
    } catch (cause) {
        const error = new Error("The AI provider could not generate a report. Please try again shortly.")
        error.code = "AI_PROVIDER_ERROR"
        error.providerStatus = cause.status || cause.statusCode
        error.providerCode = cause.code
        error.cause = cause
        throw error
    }

    let rawData
    try {
        rawData = response.parsed || (response.text ? JSON.parse(response.text) : null)
        return interviewReportSchema.parse(rawData)
    } catch (cause) {
        const error = new Error("The AI provider returned a report in an unexpected format. Please try again.")
        error.code = "AI_INVALID_RESPONSE"
        error.cause = cause
        throw error
    }
}

module.exports = generateInterviewReport;