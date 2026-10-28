const generateInterviewReport = require("../services/ai.service")
const generateResumePdf = require("../services/pdf.service")
const interviewReportModel = require("../models/interviewReport.model")
const mongoose = require("mongoose")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    const selfDescription = req.body.selfDescription?.trim() || ""
    const jobDescription = req.body.jobDescription?.trim() || ""
    let resumeText = ""
    if (req.file) {
        let pdfParse
        let CanvasFactory
        try {
            ({ CanvasFactory } = require("pdf-parse/worker"))
            pdfParse = require("pdf-parse")
        } catch (error) {
            console.error("Unable to load PDF parser:", {
                name: error.name,
                code: error.code,
                message: error.message
            })
            return res.status(503).json({
                message: "PDF resume processing is temporarily unavailable. Please try again or use the self-description field."
            })
        }

        let parser
        try {
            parser = new pdfParse.PDFParse({
                data: req.file.buffer,
                CanvasFactory
            })
            const resumeContent = await parser.getText()
            resumeText = resumeContent.text?.trim() || ""
        } catch (error) {
            const message = error.message || String(error)
            const runtimeFailure = /native binding|DOMMatrix|Path2D|ImageData|@napi-rs\/canvas/i.test(message)
            console.error("Unable to parse uploaded PDF:", {
                name: error.name,
                code: error.code,
                message,
                stack: error.stack
            })
            return res.status(runtimeFailure ? 503 : 400).json({
                message: runtimeFailure
                    ? "PDF processing is temporarily unavailable. Please try again or use the self-description field."
                    : "Unable to read the uploaded PDF. Please upload a valid, text-readable PDF."
            })
        } finally {
            if (parser) {
                try {
                    await parser.destroy()
                } catch (error) {
                    console.error("Unable to release PDF parser resources:", {
                        name: error.name,
                        code: error.code,
                        message: error.message,
                        stack: error.stack
                    })
                }
            }
        }
    }

    if (!jobDescription || (!resumeText.trim() && !selfDescription)) {
        if (req.file && !resumeText.trim()) {
            return res.status(400).json({
                message: "We couldn't find selectable text in this PDF. Upload a text-based resume or enter a self-description instead."
            })
        }
        return res.status(400).json({
            message: "A job description and either a resume or self-description are required."
        })
    }
    if (jobDescription.length > 5000 || selfDescription.length > 5000) {
        return res.status(400).json({ message: "Job and profile descriptions must be 5,000 characters or fewer." })
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params
    if (!mongoose.isValidObjectId(interviewId)) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behaviouralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    if (!mongoose.isValidObjectId(interviewReportId)) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewReportId,
        user: req.user.id
    })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const pdfBuffer = generateResumePdf(interviewReport)

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }