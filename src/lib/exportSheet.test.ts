import { expect, test } from 'vitest'
import { sheetRows } from './exportSheet'
import type { BabyRecord, RecordKind } from './types'

const rec = (at: string, kind: RecordKind, amount: number | null = null, memo: string | null = null): BabyRecord =>
  ({ id: at + kind, baby_id: 'b', recorded_at: new Date(at).toISOString(), kind, amount, memo })

test('종이 양식 모양: 머리글 3줄 + 24시간 + 합계, 숫자는 숫자로', () => {
  const rows = sheetRows('2026-11-17', 35, 4.2, [
    rec('2026-11-17T08:05:00+09:00', 'feed_formula', 100),
    rec('2026-11-17T08:40:00+09:00', 'feed_formula', 20),
    rec('2026-11-17T08:10:00+09:00', 'pee'),
    rec('2026-11-18T02:00:00+09:00', 'note', null, '보챔'),
  ])
  expect(rows).toHaveLength(3 + 24 + 1)
  expect(rows[0]).toEqual(['일자', '2026-11-17', '', '출생(D+)', 35, '', '체중(kg)', 4.2, ''])
  expect(rows[3][0]).toBe(7) // 첫 시간 칸은 7시
  expect(rows[27 - 1][0]).toBe(6) // 마지막은 다음날 6시
  const h8 = rows.find((r) => r[0] === 8)!
  expect(h8[3]).toBe(120) // 분유
  expect(h8[4]).toBe(1) // 소변
  expect(rows.find((r) => r[0] === 2)![8]).toBe('보챔')
  const total = rows[rows.length - 1]
  expect(total[0]).toBe('합계')
  expect(total[3]).toBe(120)
  expect(total[5]).toBe('') // 대변 없음
})
