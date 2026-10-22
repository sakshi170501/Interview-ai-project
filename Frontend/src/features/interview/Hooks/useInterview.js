import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useCallback, useContext } from "react"
import { InterviewContext } from "../interview.context"

export const useInterview = () => {

    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            const interviewReport = response?.interviewReport || null
            setReport(interviewReport)
            return interviewReport
        } catch (error) {
            console.error("Error generating report:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReportById = useCallback(async (id) => {
        if (!id) return null
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            // Optional chaining (?.) prevents reading properties from null
            const interviewReport = response?.interviewReport || null
            setReport(interviewReport)
            return interviewReport
        } catch (error) {
            console.error("Error fetching report by ID:", error)
            setReport(null)
            return null
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReport ])

    const getReports = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            const interviewReports = response?.interviewReports || []
            setReports(interviewReports)
            return interviewReports
        } catch (error) {
            console.error("Error fetching reports:", error)
            setReports([])
            return []
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReports ])

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            if (!response) return
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        }
        catch (error) {
            console.error("Error generating PDF:", error)
        } finally {
            setLoading(false)
        }
    }

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}