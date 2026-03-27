type StatCardProps = {
  label: string
  value: string
  change: string
  tone: 'blue' | 'green' | 'amber' | 'rose'
}

const toneClassMap = {
  blue: 'bg-[#f5f3ee] text-slate-600',
  green: 'bg-[#f1efea] text-slate-600',
  amber: 'bg-[#ebe8e1] text-slate-700',
  rose: 'bg-[#e7e3db] text-slate-700',
}

export function StatCard({ label, value, change, tone }: StatCardProps) {
  return (
    <div className={`rounded-3xl border border-black/10 ${toneClassMap[tone]} p-5 shadow-sm`}>
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-3 border-t border-black/10 pt-3 text-sm font-medium">{change}</p>
    </div>
  )
}
