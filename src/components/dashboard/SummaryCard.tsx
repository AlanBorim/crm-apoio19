import { ArrowDown, ArrowUp } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'orange' | 'blue' | 'green' | 'purple';
  onClick?: () => void;
}

const colorVariants = {
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    iconText: 'text-orange-600 dark:text-orange-400',
    text: 'text-orange-700 dark:text-orange-300',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconText: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-700 dark:text-blue-300',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    iconText: 'text-green-600 dark:text-green-400',
    text: 'text-green-700 dark:text-green-300',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconText: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-700 dark:text-purple-300',
  },
};

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  onClick,
}: SummaryCardProps) {
  const colorClasses = colorVariants[color];

  return (
    <div
      className={`${colorClasses.bg
        } rounded-lg p-6 shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''
        }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900 dark:text-slate-50">{value}</p>
            {trend && (
              <span
                className={`ml-2 flex items-center text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
              >
                {trend.isPositive ? (
                  <ArrowUp size={16} className="mr-1" />
                ) : (
                  <ArrowDown size={16} className="mr-1" />
                )}
                {trend.value}%
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses.iconBg} dark:bg-opacity-20`}
        >
          <span className={`${colorClasses.iconText} dark:text-opacity-90`}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
