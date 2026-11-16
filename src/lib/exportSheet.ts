import { SLOT_HOURS } from './careDay'
import { COLS, cellRecords, cellText, colTotal } from './sheet'
import type { BabyRecord, RecordKind } from './types'

type Cell = string | number

// 엑셀에서 합계를 낼 수 있게 숫자 칸은 숫자로, 비고는 글자로 둔다
const val = (kind: RecordKind, text: string): Cell => (kind === 'note' || text === '' ? text : Number(text))

/** 종이 기록지와 같은 모양의 행 목록 (머리글 2줄 + 24시간 + 합계) */
export function sheetRows(date: string, dplus: number | null, weight: number | null, records: BabyRecord[]): Cell[][] {
  return [
    ['일자', date, '', '출생(D+)', dplus ?? '', '', '체중(kg)', weight ?? '', ''],
    ['시', '먹는 양', '', '', '배설', '', '기타', '', '비고'],
    ['', ...COLS.filter((c) => c.kind !== 'note').map((c) => c.label), ''],
    ...SLOT_HOURS.map((h): Cell[] => [h, ...COLS.map((c) => val(c.kind, cellText(c.kind, cellRecords(records, h, c.kind))))]),
    ['합계', ...COLS.map((c) => val(c.kind, colTotal(c.kind, records)))],
  ]
}

// 헤더 병합: [시작행, 시작열, 끝행, 끝열] (0부터)
const MERGES = [[1, 0, 2, 0], [1, 1, 1, 3], [1, 4, 1, 5], [1, 6, 1, 7], [1, 8, 2, 8]]

/** xlsx 라이브러리가 커서 버튼을 눌렀을 때만 불러온다 */
export async function downloadDay(date: string, rows: Cell[][]) {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!merges'] = MERGES.map(([r, c, r2, c2]) => ({ s: { r, c }, e: { r: r2, c: c2 } }))
  ws['!cols'] = [{ wch: 6 }, ...Array(7).fill({ wch: 8 }), { wch: 28 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, date)
  XLSX.writeFile(wb, `수유기록지_${date}.xlsx`)
}
