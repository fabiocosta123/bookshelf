import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  color = 'blue' 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700'
  };

  const trendClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600'
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          
          {description && (
            <p className="text-xs mt-1 opacity-75">{description}</p>
          )}
          
          {trend && (
            <div className={`text-xs mt-1 ${trendClasses[trend.isPositive ? 'positive' : 'negative']}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        <div className="p-3 rounded-full bg-white bg-opacity-50">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}