import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadFile } from './upload'

class FakeRequest {
  static instances: FakeRequest[] = []
  upload = { onprogress: null }
  status = 200
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null
  open = vi.fn()
  setRequestHeader = vi.fn()
  send = vi.fn()
  abort = vi.fn(() => this.onabort?.())
  constructor() { FakeRequest.instances.push(this) }
}

const file = new File(['audio'], 'recording.mp3', { type: 'audio/mpeg' })

beforeEach(() => {
  FakeRequest.instances = []
  vi.stubGlobal('XMLHttpRequest', FakeRequest)
})
afterEach(() => vi.unstubAllGlobals())

describe('uploadFile', () => {
  it('does not send an upload cancelled before the request starts', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(uploadFile('/upload', file, {}, vi.fn(), controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
    expect(FakeRequest.instances).toHaveLength(0)
  })

  it('aborts a running upload', async () => {
    const controller = new AbortController()
    const pending = uploadFile('/upload', file, {}, vi.fn(), controller.signal)
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(FakeRequest.instances[0].abort).toHaveBeenCalledOnce()
  })

  it('removes the abort listener after a completed upload', async () => {
    const controller = new AbortController()
    const pending = uploadFile('/upload', file, { 'Content-Type': 'audio/mpeg' }, vi.fn(), controller.signal)
    const request = FakeRequest.instances[0]
    request.onload?.()
    await pending
    controller.abort()
    expect(request.abort).not.toHaveBeenCalled()
    expect(request.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'audio/mpeg')
  })

  it.each(['http', 'network'] as const)('rejects a failed %s upload', async kind => {
    const pending = uploadFile('/upload', file, {}, vi.fn(), new AbortController().signal)
    const request = FakeRequest.instances[0]
    if (kind === 'http') {
      request.status = 500
      request.onload?.()
    } else request.onerror?.()
    await expect(pending).rejects.toThrow(kind === 'http' ? 'Upload failed' : 'Network error while uploading')
  })
})
