import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayStat } from '../../lib/stats'

export default function TempChart({ days }: { days: DayStat[] }) {
  const data = days.map((d) => ({ label: d.date.slice(5).replace('-', '/'), temp: d.maxTemp }))
  if (data.every((d) => d.temp == null)) return <p className="text-sm text-slate-500">이 기간에 체온 기록이 없습니다.</p>
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold">일별 최고 체온 (℃)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={11} interval="preserveStartEnd" />
          <YAxis fontSize={11} width={36} domain={[36, 39]} />
          <Tooltip />
          <ReferenceLine y={37.5} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '37.5', fontSize: 11, fill: '#ef4444' }} />
          <Line dataKey="temp" name="최고 체온" stroke="#ef4444" connectNulls dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
