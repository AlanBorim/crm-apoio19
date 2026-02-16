import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface FunnelChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  title: string;
}

export function FunnelChart({ data, title }: FunnelChartProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-slate-50">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} leads`, 'Quantidade']}
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #fff)',
                borderColor: 'var(--tooltip-border, #e5e7eb)',
                color: 'var(--tooltip-text, #000)',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
