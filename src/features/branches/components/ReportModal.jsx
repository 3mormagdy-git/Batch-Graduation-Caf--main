import { Modal, btn } from '@/features/staff/ui.jsx'
import { WEEK_DAYS, formatEGP, sum } from '../branchesData.js'

// Simple weekly report built from the same weekly data the charts use.
export default function ReportModal({ title, week, currency = 'EGP', onClose }) {
  const totalSales = sum(week.sales)
  const totalOrders = sum(week.orders)
  const cell = 'px-3 py-2 text-right tabular-nums'
  return (
    <Modal title={title} subtitle="Sales and orders for the current week" onClose={onClose} width="max-w-[560px]"
      footer={<button type="button" className={btn} onClick={onClose}>Close</button>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-muted">
              <th className="px-3 py-2 text-left font-semibold">Day</th>
              <th className="px-3 py-2 text-right font-semibold">Sales</th>
              <th className="px-3 py-2 text-right font-semibold">Orders</th>
              <th className="px-3 py-2 text-right font-semibold">Avg order</th>
            </tr>
          </thead>
          <tbody>
            {WEEK_DAYS.map((day, i) => (
              <tr key={day} className="border-t border-line">
                <td className="px-3 py-2 font-medium text-ink">{day}</td>
                <td className={cell}>{formatEGP(week.sales[i], currency)}</td>
                <td className={cell}>{week.orders[i]}</td>
                <td className={cell}>{formatEGP(week.orders[i] ? week.sales[i] / week.orders[i] : 0, currency)}</td>
              </tr>
            ))}
            <tr className="border-t border-line font-bold text-ink">
              <td className="px-3 py-2">Total</td>
              <td className={cell}>{formatEGP(totalSales, currency)}</td>
              <td className={cell}>{totalOrders}</td>
              <td className={cell}>{formatEGP(totalOrders ? totalSales / totalOrders : 0, currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  )
}
