export function downloadTextFile(fileName: string, text: string, mimeType = 'application/json') {
    const url = URL.createObjectURL(new Blob([text], { type: mimeType }))
    const link = document.createElement('a')

    link.href = url
    link.download = fileName
    link.click()

    setTimeout(() => URL.revokeObjectURL(url))
}
