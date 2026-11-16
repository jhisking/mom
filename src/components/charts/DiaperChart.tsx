import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayStat } from '../../lib/stats'

export default function DiaperChart({ days }: { days: DayStat[] }) {
  const data = days.map((d) => ({ ...d, label: d.date.slice(5).replace('-', '/') }))
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold">일별 배설·구토 횟수</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={11} interval="preserveStartEnd" />
          <YAxis fontSize={11} width={28} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="pee" name="소변" fill="#38bdf8" />
          <Bar dataKey="poop" name="대변" fill="#ca8a04" />
          <Bar dataKey="vomit" name="구토" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
