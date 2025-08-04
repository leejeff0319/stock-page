import React from 'react';

export default function DashboardCard({
  title,
  subtitle,
  content,
  chartPlaceholder,
  calendarPlaceholder,
  children
}: {
  title: string;
  subtitle?: string;
  content?: string;
  chartPlaceholder?: boolean;
  calendarPlaceholder?: boolean;
  children?: React.ReactNode;
}) {
  // Simple fallback icons using text symbols
  const renderIcon = () => {
    if (title.includes('Value')) return <span className="text-blue-500 text-xl">$</span>;
    if (title.includes('Investments')) return <span className="text-green-500 text-xl">↑</span>;
    if (title.includes('Balance')) return <span className="text-purple-500 text-xl">¢</span>;
    if (title.includes('Spend')) return <span className="text-red-500 text-xl">↓</span>;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {renderIcon()}
      </div>

      {children ? (
        <div className="flex-1 mt-2">
          {children}
        </div>
      ) : (
        <div className="mt-4 flex-1">
          {content && <p className="whitespace-pre-line">{content}</p>}
          
          {chartPlaceholder && (
            <div className="mt-4 h-40 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-400">Chart Placeholder</p>
            </div>
          )}
          
          {calendarPlaceholder && (
            <div className="mt-4 h-40 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-400">Calendar Placeholder</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}