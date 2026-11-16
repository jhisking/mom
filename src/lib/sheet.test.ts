import { expect, test } from 'vitest'
import { cellRecords, cellText, colTotal } from './sheet'
import type { BabyRecord, RecordKind } from './types'

const rec = (at: string, kind: RecordKind, amount: number | null = null, memo: string | null = null): BabyRecord =>
  ({ id: at + kind + amount, baby_id: 'b', recorded_at: new Date(at).toISOString(), kind, amount, memo })

const rs = [
  rec('2026-11-17T08:05:00+09:00', 'feed_formula', 100),
  rec('2026-11-17T08:40:00+09:00', 'feed_formula', 20),
  rec('2026-11-17T08:10:00+09:00', 'pee'),
  rec('2026-11-17T08:50:00+09:00', 'pee'),
  rec('2026-11-17T09:00:00+09:00', 'temp', 37.2),
  rec('2026-11-17T09:30:00+09:00', 'temp', 37.6),
  rec('2026-11-18T02:10:00+09:00', 'note', null, '보챔'),
  rec('2026-11-17T08:30:00+09:00', 'note', null, '트림'),
]

test('칸 값: 같은 시간대 양은 합, 횟수는 개수, 체온은 마지막 값', () => {
  expect(cellText('feed_formula', cellRecords(rs, 8, 'feed_formula'))).toBe('120')
  expect(cellText('pee', cellRecords(rs, 8, 'pee'))).toBe('2')
  expect(cellText('temp', cellRecords(rs, 9, 'temp'))).toBe('37.6')
  expect(cellText('pee', cellRecords(rs, 9, 'pee'))).toBe('')
})

test('00시대 기록은 0시 칸, 비고는 메모 텍스트', () => {
  expect(cellText('note', cellRecords(rs, 2, 'note'))).toBe('보챔')
  expect(cellText('note', cellRecords(rs, 8, 'note'))).toBe('트림')
})

test('합계 행: 양 합, 횟수, 체온 최고값, 비고는 비움', () => {
  expect(colTotal('feed_formula', rs)).toBe('120')
  expect(colTotal('pee', rs)).toBe('2')
  expect(colTotal('temp', rs)).toBe('37.6')
  expect(colTotal('note', rs)).toBe('')
  expect(colTotal('poop', rs)).toBe('')
})
