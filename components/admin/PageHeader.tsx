type PageHeaderProps = {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-[#fbfaf7] p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Admin Page
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}
