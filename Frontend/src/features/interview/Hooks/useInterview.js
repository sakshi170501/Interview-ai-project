import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useCallback, useContext } from "react"
import { InterviewContext } from "../interview.context"

export const useInterview = () => {

    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
        historyError,
        setHistoryError,
        reportError,
        setReportError,
        downloading,
        setDownloading,
        downloadError,
        setDownloadError
    } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            const interviewReport = response?.interviewReport || null
            setReport(interviewReport)
            return interviewReport
        } finally {
            setLoading(false)
        }
    }

    const getReportById = useCallback(async (id) => {
        if (!id) return null
        setReportError("")
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            const interviewReport = response?.interviewReport || null
            setReport(interviewReport)
            return interviewReport
        } catch (error) {
            setReportError(error.response?.data?.message || "Unable to load this interview plan.")
            setReport(null)
            return null
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReport, setReportError ])

    const getReports = useCallback(async () => {
        setHistoryError("")
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            const interviewReports = response?.interviewReports || []
            setReports(interviewReports)
            return interviewReports
        } catch (error) {
            setHistoryError(error.response?.data?.message || "Unable to load your recent interview plans.")
            setReports([])
            return []
        } finally {
            setLoading(false)
        }
    }, [ setHistoryError, setLoading, setReports ])

    const getResumePdf = async (interviewReportId) => {
        setDownloading(true)
        setDownloadError("")
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(response)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
        }
        catch (error) {
            setDownloadError(error.response?.data?.message || "Unable to download the resume PDF. Please try again.")
        } finally {
            setDownloading(false)
        }
    }

    return {
        loading,
        report,
        reports,
        historyError,
        reportError,
        downloading,
        downloadError,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    }
}