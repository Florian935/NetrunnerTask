import { describe, expect, it } from 'vitest'
import {
  ACCELERATOR_BY_ID,
  boostMultiplier,
  boostWindows,
  cancel,
  canStart,
  resolve,
  start,
  type AcceleratorCore,
} from './accelerators'

const focus = ACCELERATOR_BY_ID.focus

const mk = (
  acceleratorRun: AcceleratorCore['acceleratorRun'] = null,
  acceleratorBoost: AcceleratorCore['acceleratorBoost'] = null,
): AcceleratorCore => ({ acceleratorRun, acceleratorBoost })

describe('canStart', () => {
  it('vrai au repos, pour un accélérateur du catalogue', () => {
    expect(canStart(mk(), 'focus')).toBe(true)
  })
  it('faux pour un id inconnu', () => {
    expect(canStart(mk(), 'nope')).toBe(false)
  })
  it('faux si une session est déjà en cours (AC6, anti-empilement)', () => {
    expect(canStart(mk({ id: 'focus', endsAt: 1000 }), 'focus')).toBe(false)
  })
  it('faux si un boost est déjà actif (AC6, anti-empilement)', () => {
    expect(canStart(mk(null, { id: 'focus', endsAt: 1000 }), 'focus')).toBe(false)
  })
})

describe('start', () => {
  it('pose acceleratorRun avec une échéance absolue', () => {
    const next = start(mk(), 'focus', 1_000_000)
    expect(next.acceleratorRun).toEqual({ id: 'focus', endsAt: 1_000_000 + focus.durationMs })
  })
  it('no-op (même référence) si !canStart', () => {
    const s = mk({ id: 'focus', endsAt: 1000 })
    expect(start(s, 'focus', 2000)).toBe(s)
  })
})

describe('cancel', () => {
  it('vide acceleratorRun, aucune pénalité au-delà (AC5)', () => {
    const next = cancel(mk({ id: 'focus', endsAt: 1000 }))
    expect(next.acceleratorRun).toBeNull()
  })
  it('no-op (même référence) si aucune session en cours', () => {
    const s = mk()
    expect(cancel(s)).toBe(s)
  })
  it("n'affecte pas un boost actif (seule la session en cours peut être abandonnée)", () => {
    const s = mk(null, { id: 'focus', endsAt: 1000 })
    expect(cancel(s)).toBe(s)
  })
})

describe('resolve', () => {
  it('no-op (même référence) tant que rien n’est échu', () => {
    const s = mk({ id: 'focus', endsAt: 1000 })
    expect(resolve(s, 500)).toBe(s)
  })
  it('session échue → devient un boost ancré sur run.endsAt (pas sur `now`)', () => {
    const s = mk({ id: 'focus', endsAt: 1000 })
    const next = resolve(s, 1000)
    expect(next.acceleratorRun).toBeNull()
    expect(next.acceleratorBoost).toEqual({ id: 'focus', endsAt: 1000 + focus.boostDurationMs })
  })
  it('boost échu → redevient null', () => {
    const s = mk(null, { id: 'focus', endsAt: 1000 })
    const next = resolve(s, 1000)
    expect(next.acceleratorBoost).toBeNull()
  })
  it('rattrapage : run très en retard résout directement en boost déjà expiré', () => {
    const s = mk({ id: 'focus', endsAt: 1000 })
    const farFuture = 1000 + focus.boostDurationMs + 1
    const next = resolve(s, farFuture)
    expect(next.acceleratorRun).toBeNull()
    expect(next.acceleratorBoost).toBeNull()
  })
})

describe('boostMultiplier', () => {
  it('neutre (1) sans boost actif', () => {
    expect(boostMultiplier(mk(), 0)).toEqual({ cycles: 1, data: 1 })
  })
  it('applique boostEffect pendant le boost', () => {
    const s = mk(null, { id: 'focus', endsAt: 1000 })
    expect(boostMultiplier(s, 500)).toEqual({ cycles: 1 + (focus.boostEffect.cycles ?? 0), data: 1 })
  })
  it('défensif : neutre si le boost est en réalité expiré (non résolu)', () => {
    const s = mk(null, { id: 'focus', endsAt: 1000 })
    expect(boostMultiplier(s, 1000)).toEqual({ cycles: 1, data: 1 })
  })
})

describe('boostWindows — calendrier hors-ligne (US-024)', () => {
  const m = 1 + (focus.boostEffect.cycles ?? 0)

  it('ni run ni boost → un seul segment neutre ouvert', () => {
    const w = boostWindows(mk(), 0)
    expect(w).toEqual([{ untilMs: Infinity, cycles: 1, data: 1 }])
  })

  it('boost seul en cours → segment boosté puis segment neutre', () => {
    const w = boostWindows(mk(null, { id: 'focus', endsAt: 5000 }), 1000)
    expect(w).toEqual([
      { untilMs: 5000, cycles: m, data: 1 },
      { untilMs: Infinity, cycles: 1, data: 1 },
    ])
  })

  it('run en cours → neutre jusqu’à runEnd, boosté (SURCADENCE), puis neutre', () => {
    const w = boostWindows(mk({ id: 'focus', endsAt: 4000 }), 1000)
    expect(w).toEqual([
      { untilMs: 4000, cycles: 1, data: 1 },
      { untilMs: 4000 + focus.boostDurationMs, cycles: m, data: 1 },
      { untilMs: Infinity, cycles: 1, data: 1 },
    ])
  })

  it('garde défensive : boost déjà expiré à fromMs → segment neutre seul', () => {
    const w = boostWindows(mk(null, { id: 'focus', endsAt: 500 }), 1000)
    expect(w).toEqual([{ untilMs: Infinity, cycles: 1, data: 1 }])
  })
})
