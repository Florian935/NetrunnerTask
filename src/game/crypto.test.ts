import { describe, expect, it } from 'vitest'
import { canConvert, convert, MARKET_CONFIG, marketRate, type CryptoCore } from './crypto'

const mk = (data: number, crypto = 0): CryptoCore => ({ data, crypto })

describe('marketRate — déterministe, borné', () => {
  it('le même instant renvoie toujours le même cours', () => {
    const t = 1_753_000_000_000
    expect(marketRate(t)).toBe(marketRate(t))
  })
  it('reste borné (somme des amplitudes autour de la moyenne)', () => {
    const maxSwing = MARKET_CONFIG.waves.reduce((s, w) => s + w.amplitude, 0)
    for (let i = 0; i < 500; i++) {
      const t = i * 137_000 // pas irrégulier pour balayer des phases variées
      const r = marketRate(t)
      expect(r).toBeGreaterThanOrEqual(MARKET_CONFIG.mean - maxSwing - 1e-9)
      expect(r).toBeLessThanOrEqual(MARKET_CONFIG.mean + maxSwing + 1e-9)
    }
  })
  it('varie dans le temps (pas une constante)', () => {
    const a = marketRate(0)
    const b = marketRate(10 * 60 * 1000)
    expect(a).not.toBeCloseTo(b, 5)
  })
})

describe('canConvert', () => {
  it('faux si montant nul ou négatif', () => {
    expect(canConvert(mk(1000), 0)).toBe(false)
    expect(canConvert(mk(1000), -10)).toBe(false)
  })
  it('faux si solde data insuffisant', () => {
    expect(canConvert(mk(500), 1000)).toBe(false)
  })
  it('vrai si montant valide et solde suffisant', () => {
    expect(canConvert(mk(1000), 1000)).toBe(true)
  })
})

describe('convert', () => {
  it('no-op (même référence) si !canConvert', () => {
    const s = mk(100)
    expect(convert(s, 1000, 2)).toBe(s)
    expect(convert(s, 0, 2)).toBe(s)
  })
  it('débite data et crédite crypto au taux effectif fourni', () => {
    const next = convert(mk(2000), 1000, 2.5)
    expect(next.data).toBe(1000)
    expect(next.crypto).toBe(2) // floor((1000/1000) * 2.5) = 2
  })
  it('arrondit le crypto crédité à l’entier inférieur', () => {
    const next = convert(mk(1000), 500, 1.99)
    expect(next.crypto).toBe(0) // floor(0.5 * 1.99) = floor(0.995) = 0
  })
  it('conserve le crypto déjà possédé (additif)', () => {
    const next = convert(mk(1000, 50), 1000, 2)
    expect(next.crypto).toBe(52)
  })
})
