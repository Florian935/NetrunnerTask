import { describe, expect, it } from 'vitest'
import { CALLSIGN_MAX, DEFAULT_CALLSIGN, normalizeCallsign } from './profile'

describe('normalizeCallsign', () => {
  it('replie sur le défaut si vide ou blanc', () => {
    expect(normalizeCallsign('')).toBe(DEFAULT_CALLSIGN)
    expect(normalizeCallsign('   ')).toBe(DEFAULT_CALLSIGN)
  })

  it('passe en majuscules', () => {
    expect(normalizeCallsign('runner-7f')).toBe('RUNNER-7F')
  })

  it('rogne les espaces de bord', () => {
    expect(normalizeCallsign('  neo  ')).toBe('NEO')
  })

  it('borne à CALLSIGN_MAX caractères', () => {
    const out = normalizeCallsign('ABCDEFGHIJKLMNOP')
    expect(out.length).toBeLessThanOrEqual(CALLSIGN_MAX)
    expect(out).toBe('ABCDEFGHIJKL')
  })

  it('filtre les caractères interdits (garde A-Z 0-9 espace tiret)', () => {
    expect(normalizeCallsign('r@un#ner!')).toBe('RUNNER')
    expect(normalizeCallsign('N3O-X')).toBe('N3O-X')
  })

  it('est idempotente', () => {
    const once = normalizeCallsign('  gh0st-net!!  ')
    expect(normalizeCallsign(once)).toBe(once)
  })
})
