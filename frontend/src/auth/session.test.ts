import { afterEach, beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('window', { location: { origin: 'http://localhost:5173', search: '?code=test-code&state=test-state' } })
  const values = new Map([
    ['echoscript.oauth.state', 'test-state'],
    ['echoscript.pkce.verifier', 'test-verifier'],
  ])
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
  })
})
afterEach(() => vi.unstubAllGlobals())

it('exchanges a callback code once when effects run concurrently', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ access_token: 'test-token' }) })
  vi.stubGlobal('fetch', fetch)
  const { completeLogin, bearerToken } = await import('./session')
  await Promise.all([completeLogin(), completeLogin()])
  expect(fetch).toHaveBeenCalledOnce()
  expect(bearerToken()).toBe('test-token')
  expect(sessionStorage.getItem('echoscript.oauth.state')).toBeNull()
  expect(sessionStorage.getItem('echoscript.pkce.verifier')).toBeNull()
})

it('rejects callbacks with an invalid state before exchanging tokens', async () => {
  window.location.search = '?code=test-code&state=wrong-state'
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  const { completeLogin } = await import('./session')
  await expect(completeLogin()).rejects.toThrow('could not be validated')
  expect(fetch).not.toHaveBeenCalled()
})
