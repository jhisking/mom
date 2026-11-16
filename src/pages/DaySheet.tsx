import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDay } from '../api/useDay'
import { addRecord } from '../api/records'
import { careDate, shiftDate, slotHour, slotToDate } from '../lib/careDay'
import { cellRecords } from '../lib/sheet'
import { downloadDay, sheetRows } from '../lib/exportSheet'
import type { BabyRecord, RecordKind } from '../lib/types'
import CellSheet from '../components/CellSheet'
import DayTable from '../components/DayTable'
import RecordSheet from '../components/RecordSheet'

// 양 입력이 필요 없는 칸은 빈 칸을 탭하면 바로 1건 저장한다
const ONE_TAP: RecordKind[] = ['pee', 'poop', 'vomit']

type Modal =
  | { t: 'cell'; hour: number; kind: RecordKind }
  | { t: 'rec'; kind: RecordKind; time: Date; initial?: BabyRecord }
  | null

export default function DaySheet({ babyId, birthDate }: { babyId: string; birthDate: string | null }) {
  const nav = useNavigate()
  const date = useParams().date ?? careDate(new Date())
  const { records, error, reload } = useDay(babyId, date)
  const [modal, setModal] = useState<Modal>(null)
  const [msg, setMsg] = useState('')
  const go = (d: number) => nav(`/day/${shiftDate(date, d)}`)

  // 지금이 그 칸의 시간대면 현재 시각, 아니면 칸의 정각
  const slotTime = (h: number) => {
    const now = new Date()
    return careDate(now) === date && slotHour(now) === h ? now : slotToDate(date, h)
  }

  const onCell = async (hour: number, kind: RecordKind) => {
    if (cellRecords(records, hour, kind).length) return setModal({ t: 'cell', hour, kind })
    if (!ONE_TAP.includes(kind)) return setModal({ t: 'rec', kind, time: slotTime(hour) })
    try {
      await addRecord({ baby_id: babyId, recorded_at: slotTime(hour).toISOString(), kind, amount: null, memo: null })
      reload()
    } catch (e) { setMsg((e as Error).message) }
  }

  const weights = records.filter((r) => r.kind === 'weight')
  const weight = weights[weights.length - 1]
  const dplus = birthDate ? Math.round((Date.parse(date) - Date.parse(birthDate)) / 86400000) : null
  const edit = (r: BabyRecord) => setModal({ t: 'rec', kind: r.kind, time: new Date(r.recorded_at), initial: r })
  const cell = modal?.t === 'cell' ? modal : null
  const exportXlsx = () =>
    downloadDay(date, sheetRows(date, dplus, weight?.amount ?? null, records)).catch((e) => setMsg(e.message))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => go(-1)} aria-label="전날" className="h-12 w-12 shrink-0 rounded-full bg-white text-xl shadow-sm">‹</button>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold">{date}</div>
          <div className="text-xs text-slate-500">오전 7시 ~ 다음날 오전 7시</div>
        </div>
        <button onClick={() => go(1)} aria-label="다음날" className="h-12 w-12 shrink-0 rounded-full bg-white text-xl shadow-sm">›</button>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2 shadow-sm">
        <div className="font-semibold">출생 {dplus == null ? '-' : `D+${dplus}`}</div>
        <button onClick={() => weight ? edit(weight) : setModal({ t: 'rec', kind: 'weight', time: slotTime(7) })}
          className="h-11 rounded-lg bg-violet-100 px-3 font-semibold text-violet-900">
          체중 {weight?.amount != null ? `${weight.amount}kg` : '입력'}
        </button>
      </div>
      {(error || msg) && <p className="text-sm text-red-600">{error || msg}</p>}
      <DayTable records={records} onCell={onCell} />
      <button onClick={exportXlsx} className="h-12 w-full rounded-xl bg-emerald-600 font-semibold text-white">
        📥 이 날 기록지 엑셀로 다운로드
      </button>
      {cell && (
        <CellSheet hour={cell.hour} kind={cell.kind} records={cellRecords(records, cell.hour, cell.kind)}
          onEdit={edit} onAdd={() => setModal({ t: 'rec', kind: cell.kind, time: slotTime(cell.hour) })}
          onClose={() => setModal(null)} />
      )}
      {modal?.t === 'rec' && (
        <RecordSheet key={modal.initial?.id ?? modal.time.getTime()} babyId={babyId} lock
          kind={modal.kind} time={modal.time} initial={modal.initial}
          onClose={() => setModal(null)} onSaved={reload} />
      )}
    </div>
  )
}
