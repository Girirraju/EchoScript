export function uploadFile(
  url: string,
  file: File,
  headers: Record<string, string>,
  onProgress: (value: number) => void,
  signal: AbortSignal,
) {
  return new Promise<void>((resolve, reject) => {
    const cancelled = () => new DOMException('Upload cancelled', 'AbortError')
    if (signal.aborted) {
      reject(cancelled())
      return
    }

    const request = new XMLHttpRequest()
    const abort = () => request.abort()
    const cleanup = () => signal.removeEventListener('abort', abort)
    request.open('PUT', url)
    Object.entries(headers).forEach(([key, value]) => request.setRequestHeader(key, value))
    request.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () => {
      cleanup()
      if (request.status >= 200 && request.status < 300) resolve()
      else reject(new Error('Upload failed'))
    }
    request.onerror = () => {
      cleanup()
      reject(new Error('Network error while uploading'))
    }
    request.onabort = () => {
      cleanup()
      reject(cancelled())
    }
    signal.addEventListener('abort', abort, { once: true })
    try {
      request.send(file)
    } catch (error) {
      cleanup()
      reject(error)
    }
  })
}
