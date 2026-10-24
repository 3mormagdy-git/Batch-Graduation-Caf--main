import { formatDifference, formatWhole } from './staffData.js'

export function DifferenceChip({ value }) {
  const style = value === 0
    ? { box: 'bg-success-soft text-success', dot: 'bg-success', text: 'Balanced' }
    : value < 0
      ? { box: 'bg-[#fbe9ea] text-danger', dot: 'bg-danger', text: formatDifference(value) }
      : { box: 'bg-[#fbf1e0] text-[#9a6412]', dot: 'bg-amber', text: formatDifference(value) }
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[11px] font-semibold ${style.box}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.text}
    </span>
  )
}

// Shift history table (Shifts tab and employee profile).
export default function ShiftHistory({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="h-10 border-b border-line text-[11px] font-medium text-muted">
            <th className="pl-5 font-medium">Employee</th>
            <th className="font-medium">Branch / register</th>
            <th className="font-medium">Period</th>
            <th className="text-right font-medium">Sales</th>
            <th className="text-right font-medium">Expected cash</th>
            <th className="text-right font-medium">Counted</th>
            <th className="pr-5 text-right font-medium">Difference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="h-[52px] border-b border-line last:border-b-0">
              <td className="pl-5 font-bold text-ink">{row.employee}</td>
              <td className="text-text">{row.branch}</td>
              <td className="whitespace-nowrap text-text">{row.period}</td>
              <td className="text-right font-bold text-ink">{formatWhole(row.sales)}</td>
              <td className="text-right text-muted">{formatWhole(row.expected)}</td>
              <td className="text-right text-muted">{formatWhole(row.counted)}</td>
              <td className="pr-5 text-right"><DifferenceChip value={row.difference} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
