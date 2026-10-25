const pdfParse = require("pdf-parse")
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
        const parser = new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))
        try {
            const resumeContent = await parser.getText()
            resumeText = resumeContent.text
        } catch {
            return res.status(400).json({
                message: "Unable to read the uploaded PDF. Please upload a valid, text-readable PDF."
            })
        } finally {
            await parser.destroy()
        }
    }

    if (!jobDescription || (!resumeText.trim() && !selfDescription)) {
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