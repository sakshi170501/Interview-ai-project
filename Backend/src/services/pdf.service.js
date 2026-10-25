function escapePdfText(value) {
    return String(value)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "?")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
}

function wrapText(value, maxLength = 92) {
    const lines = []

    for (const paragraph of String(value || "").split(/\r?\n/)) {
        const words = paragraph.trim().split(/\s+/).filter(Boolean)
        let line = ""

        for (const word of words) {
            if (word.length > maxLength) {
                if (line) lines.push(line)
                line = ""
                for (let index = 0; index < word.length; index += maxLength) {
                    lines.push(word.slice(index, index + maxLength))
                }
                continue
            }

            if (line && `${line} ${word}`.length > maxLength) {
                lines.push(line)
                line = word
            } else {
                line = line ? `${line} ${word}` : word
            }
        }

        if (line) lines.push(line)
        else if (!words.length) lines.push("")
    }

    return lines
}

function createPdf(pages) {
    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        null,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    ]
    const pageReferences = []

    for (const lines of pages) {
        const pageNumber = objects.length + 1
        const contentNumber = pageNumber + 1
        pageReferences.push(`${pageNumber} 0 R`)
        const text = [
            "BT",
            "/F1 10 Tf",
            "50 790 Td",
            "14 TL",
            ...lines.map((line, index) => `${index ? "T* " : ""}(${escapePdfText(line)}) Tj`),
            "ET"
        ].join("\n")
        objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentNumber} 0 R >>`)
        objects.push(`<< /Length ${Buffer.byteLength(text, "ascii")} >>\nstream\n${text}\nendstream`)
    }

    objects[1] = `<< /Type /Pages /Kids [${pageReferences.join(" ")}] /Count ${pages.length} >>`

    let output = "%PDF-1.4\n"
    const offsets = [0]
    for (let index = 0; index < objects.length; index += 1) {
        offsets.push(Buffer.byteLength(output, "ascii"))
        output += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`
    }

    const xrefOffset = Buffer.byteLength(output, "ascii")
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    for (const offset of offsets.slice(1)) {
        output += `${String(offset).padStart(10, "0")} 00000 n \n`
    }
    output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

    return Buffer.from(output, "ascii")
}

function generateResumePdf(report) {
    const lines = [
        "CANDIDATE RESUME",
        "",
        `Target role: ${report.title || "Interview preparation plan"}`,
        "",
        "PROFILE",
        report.selfDescription || "No additional profile summary was provided.",
        "",
        "RESUME",
        report.resume || "No resume file was provided.",
        "",
        "ROLE MATCH",
        `Match score: ${report.matchScore}%`,
        "",
        "FOCUS AREAS",
        ...(report.skillGaps || []).map((gap) => `- ${gap.skill} (${gap.severity} priority)`),
        ...(report.skillGaps?.length ? [] : ["No focus areas were identified."])
    ].flatMap((line) => wrapText(line))
    const pages = []

    for (let index = 0; index < lines.length; index += 55) {
        pages.push(lines.slice(index, index + 55))
    }

    return createPdf(pages)
}

module.exports = generateResumePdf
