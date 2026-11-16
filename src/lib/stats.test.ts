import { expect, test } from 'vitest'
import { dailyStats, periodDates, shiftPeriod, summarize } from './stats'
import type { BabyRecord, RecordKind } from './types'

const rec = (at: string, kind: RecordKind, amount: number | null = null): BabyRecord =>
  ({ id: at + kind, baby_id: 'b', recorded_at: new Date(at).toISOString(), kind, amount, memo: null })

test('주는 월~일, 월은 말일까지', () => {
  expect(periodDates('week', '2026-11-17')).toEqual(
    ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'])
  expect(periodDates('week', '2026-11-22')[0]).toBe('2026-11-16') // 일요일은 그 주의 끝
  expect(periodDates('month', '2026-02-10')).toHaveLength(28)
  expect(periodDates('month', '2026-11-17')).toHaveLength(30)
})

test('기간 이동', () => {
  expect(shiftPeriod('week', '2026-11-17', -1)).toBe('2026-11-10')
  expect(shiftPeriod('month', '2026-12-15', 1)).toBe('2027-01-01')
  expect(shiftPeriod('month', '2026-01-31', 1)).toBe('2026-02-01')
  expect(shiftPeriod('month', '2026-03-05', -1)).toBe('2026-02-01')
})

test('일별 집계: 7시 경계와 항목별 합계', () => {
  const rs = [
    rec('2026-11-17T06:30:00+09:00', 'pee'), // 전날 귀속
    rec('2026-11-17T08:00:00+09:00', 'feed_formula', 100),
    rec('2026-11-17T11:00:00+09:00', 'feed_breast_milk', 60),
    rec('2026-11-17T14:00:00+09:00', 'feed_direct', 10),
    rec('2026-11-18T01:00:00+09:00', 'temp', 37.6),
    rec('2026-11-17T09:00:00+09:00', 'temp', 36.8),
    rec('2026-11-17T10:00:00+09:00', 'vomit'),
  ]
  const days = dailyStats(rs, ['2026-11-16', '2026-11-17'])
  expect(days[0].pee).toBe(1)
  expect(days[1]).toMatchObject({ formula: 100, milk: 60, direct: 10, feeds: 3, vomit: 1, maxTemp: 37.6, pee: 0 })
})

test('요약: 일평균과 수유 간격', () => {
  const rs = [
    rec('2026-11-17T08:00:00+09:00', 'feed_formula', 100),
    rec('2026-11-17T11:00:00+09:00', 'feed_formula', 80),
    rec('2026-11-17T12:00:00+09:00', 'feed_direct', 10),
  ]
  const s = summarize(dailyStats(rs, periodDates('week', '2026-11-17')), rs)
  expect(s.activeDays).toBe(1)
  expect(s.avgFeeds).toBe(3)
  expect(s.avgMl).toBe(180)
  expect(s.avgIntervalMin).toBe(120)
  expect(summarize(dailyStats([], ['2026-11-17']), []).avgIntervalMin).toBeNull()
})
