import { useState } from "react";
import { InterviewContext } from "./interview.context";

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [historyError, setHistoryError] = useState("")
    const [reportError, setReportError] = useState("")
    const [downloading, setDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState("")

    return (
        <InterviewContext.Provider value={{
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
        }}>
            {children}
        </InterviewContext.Provider>
    )
}