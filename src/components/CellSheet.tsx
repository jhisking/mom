import { KINDS, fmt, type BabyRecord, type RecordKind } from '../lib/types'

/** 한 칸(시간×항목)에 기록이 여러 건일 때 목록: 탭하면 수정, "추가"로 한 건 더 */
export default function CellSheet({ hour, kind, records, onEdit, onAdd, onClose }: {
  hour: number; kind: RecordKind; records: BabyRecord[]
  onEdit: (r: BabyRecord) => void; onAdd: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/40 sm:items-center sm:justify-center" onClick={onClose}>
      <div className="max-h-[90vh] w-full overflow-auto rounded-t-2xl bg-white p-4 sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-3 text-lg font-bold">{String(hour).padStart(2, '0')}시 · {KINDS[kind].icon} {KINDS[kind].label}</h2>
        <ul className="space-y-2">
          {records.map((r) => (
            <li key={r.id}>
              <button onClick={() => onEdit(r)}
                className={`flex h-12 w-full items-center justify-between rounded-lg px-3 font-semibold ${KINDS[kind].color}`}>
                <span>{kind === 'note' ? r.memo : fmt(r)}</span>
                <span className="text-sm font-normal">
                  {new Date(r.recorded_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="h-12 flex-1 rounded-lg bg-slate-200 font-semibold">닫기</button>
          <button onClick={onAdd} className="h-12 flex-[2] rounded-lg bg-pink-500 font-semibold text-white">+ 추가</button>
        </div>
      </div>
    </div>
  )
}
