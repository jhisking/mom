import { expect, test } from 'vitest'
import { careDate, careDayRange, shiftDate, slotHour, slotToDate, SLOT_HOURS } from './careDay'

test('06:59 KST는 전날 기록일, 07:00 KST부터 당일', () => {
  expect(careDate(new Date('2026-11-17T06:59:00+09:00'))).toBe('2026-11-16')
  expect(careDate(new Date('2026-11-17T07:00:00+09:00'))).toBe('2026-11-17')
  expect(careDate(new Date('2026-11-17T23:30:00+09:00'))).toBe('2026-11-17')
  expect(careDate(new Date('2026-11-18T00:10:00+09:00'))).toBe('2026-11-17')
})

test('시간 칸은 KST 시', () => {
  expect(slotHour(new Date('2026-11-17T00:30:00+09:00'))).toBe(0)
  expect(slotHour(new Date('2026-11-17T15:00:00Z'))).toBe(0)
})

test('기록일 범위는 07:00 ~ 익일 07:00', () => {
  const [s, e] = careDayRange('2026-11-17')
  expect(s.toISOString()).toBe('2026-11-16T22:00:00.000Z')
  expect(e.toISOString()).toBe('2026-11-17T22:00:00.000Z')
})

test('slotToDate: 00~06시는 다음 날, 왕복 일치', () => {
  expect(slotToDate('2026-11-17', 7).toISOString()).toBe('2026-11-16T22:00:00.000Z')
  expect(slotToDate('2026-11-17', 2).toISOString()).toBe('2026-11-17T17:00:00.000Z')
  for (const h of SLOT_HOURS) {
    const d = slotToDate('2026-11-17', h)
    expect(careDate(d)).toBe('2026-11-17')
    expect(slotHour(d)).toBe(h)
  }
})

test('칸 순서와 날짜 이동', () => {
  expect(SLOT_HOURS[0]).toBe(7)
  expect(SLOT_HOURS[23]).toBe(6)
  expect(shiftDate('2026-11-30', 1)).toBe('2026-12-01')
})
