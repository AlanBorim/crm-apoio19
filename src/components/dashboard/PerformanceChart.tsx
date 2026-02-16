import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  data: {
    name: string;
    leads: number;
    propostas: number;
    meta: number;
  }[];
  title: string;
}

export function PerformanceChart({ data, title }: PerformanceChartProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-slate-50">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
            <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-slate-400" tick={{ fill: 'currentColor' }} />
            <YAxis stroke="#6b7280" className="dark:stroke-slate-400" tick={{ fill: 'currentColor' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #fff)',
                borderColor: 'var(--tooltip-border, #e5e7eb)',
                color: 'var(--tooltip-text, #000)',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Legend />
            <Bar dataKey="leads" name="Leads" fill="#FF6B00" />
            <Bar dataKey="propostas" name="Propostas" fill="#0073EA" />
            <Bar dataKey="meta" name="Meta" fill="#00C875" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
