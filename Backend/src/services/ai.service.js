const { GoogleGenAI } = require("@google/genai");
const { interviewReportSchema, createGeminiResponseSchema } = require("./report.schema")

function getProviderErrorDetails(cause) {
    let responseError
    const message = cause?.message || String(cause)
    const jsonStart = message.indexOf("{")

    if (jsonStart >= 0) {
        try {
            responseError = JSON.parse(message.slice(jsonStart)).error
        } catch {
            responseError = null
        }
    }

    return {
        status: Number(cause?.status || cause?.statusCode || responseError?.code) || undefined,
        code: cause?.code || responseError?.status || responseError?.code || undefined,
        message: responseError?.message || message
    }
}

function createProviderError(cause, model) {
    const details = getProviderErrorDetails(cause)
    const error = new Error("The AI provider could not generate a report. Please try again shortly.")
    error.code = "AI_PROVIDER_ERROR"
    error.providerStatus = details.status
    error.providerCode = details.code
    error.providerMessage = details.message
    error.providerModel = model
    error.cause = cause
    return error
}

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

    const model = process.env.GOOGLE_GENAI_MODEL || "gemini-3.8-flash"
    const fallbackModel = "gemini-3.6-flash"
    const request = (modelName) => ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: jsonSchema,
        }
    })

    let response
    try {
        response = await request(model)
    } catch (cause) {
        const primaryError = createProviderError(cause, model)
        if (primaryError.providerStatus !== 503 || model === fallbackModel) {
            throw primaryError
        }

        console.warn("Primary Gemini model unavailable; trying fallback model:", {
            model,
            fallbackModel,
            status: primaryError.providerStatus,
            code: primaryError.providerCode,
            message: primaryError.providerMessage
        })

        try {
            response = await request(fallbackModel)
        } catch (fallbackCause) {
            throw createProviderError(fallbackCause, fallbackModel)
        }
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