import type { ReactNode } from 'react'

type Column<T> = {
  key: keyof T
  header: string
  render?: (value: any, row: T) => ReactNode
}

type DataTableProps<T> = {
  columns: ReadonlyArray<Column<T>>
  data: T[]
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = '표시할 데이터가 없습니다.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/80">
                  {columns.map((column) => {
                    const value = row[column.key]
                    return (
                      <td key={String(column.key)} className="px-4 py-4 text-sm text-slate-600">
                        {column.render ? column.render(value, row) : String(value ?? '')}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
