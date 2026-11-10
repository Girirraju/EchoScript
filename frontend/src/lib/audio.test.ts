import { describe, expect, it } from 'vitest'
import { audioContentType } from './audio'

describe('audioContentType', () => {
  it.each([
    ['meeting.WAV', 'audio/x-wav', 'audio/wav'],
    ['recording.m4a', 'audio/m4a', 'audio/mp4'],
    ['interview.mp3', '', 'audio/mpeg'],
  ])('normalizes browser MIME types for %s', (name, type, expected) => {
    expect(audioContentType({ name, type })).toBe(expected)
  })

  it('preserves unknown types so the API can reject them', () => {
    expect(audioContentType({ name: 'notes.txt', type: 'text/plain' })).toBe('text/plain')
  })
})
