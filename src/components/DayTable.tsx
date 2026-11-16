import { SLOT_HOURS } from '../lib/careDay'
import { COLS, GROUPS, cellRecords, cellText, colTotal } from '../lib/sheet'
import { KINDS, type BabyRecord, type RecordKind } from '../lib/types'

const th = 'border border-slate-300 bg-slate-100 px-1 py-2 text-center text-sm font-semibold'
const td = 'border border-slate-200 p-0 text-center'

/** 종이 기록지와 같은 시간 × 항목 표. 칸을 탭해서 입력한다. */
export default function DayTable({ records, onCell }: {
  records: BabyRecord[]; onCell: (hour: number, kind: RecordKind) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full min-w-[600px] table-fixed border-collapse">
        <colgroup>
          <col className="w-12" />
          {COLS.map((c) => <col key={c.kind} className={c.kind === 'note' ? 'w-40' : 'w-16'} />)}
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2} className={`${th} sticky left-0 z-[1]`}>시</th>
            {GROUPS.map((g) => <th key={g.label} colSpan={g.span} className={th}>{g.label}</th>)}
            <th rowSpan={2} className={th}>비고</th>
          </tr>
          <tr>{COLS.filter((c) => c.kind !== 'note').map((c) => <th key={c.kind} className={th}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {SLOT_HOURS.map((h) => (
            <tr key={h}>
              <th className={`${td} sticky left-0 z-[1] bg-slate-50 text-sm font-semibold`}>{h}</th>
              {COLS.map((c) => {
                const rs = cellRecords(records, h, c.kind)
                const text = cellText(c.kind, rs)
                return (
                  <td key={c.kind} className={td}>
                    <button onClick={() => onCell(h, c.kind)} aria-label={`${h}시 ${c.label}`}
                      className={`h-11 w-full px-1 text-sm font-semibold ${text ? KINDS[c.kind].color : 'text-slate-300'} ${c.kind === 'note' ? 'truncate text-left' : ''}`}>
                      {text || '·'}
                      {rs.some((r) => r.memo) && c.kind !== 'note' && <sup className="ml-0.5">•</sup>}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
          <tr>
            <th className={`${th} sticky left-0 z-[1]`}>합계</th>
            {COLS.map((c) => <td key={c.kind} className={`${td} h-11 bg-slate-100 text-sm font-bold`}>{colTotal(c.kind, records)}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
