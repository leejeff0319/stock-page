import React from "react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  content?: string;
  chartPlaceholder?: boolean;
  calendarPlaceholder?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  content,
  chartPlaceholder,
  calendarPlaceholder,
}) => {
  return (
    <div className="rounded-2xl bg-white shadow-md p-4 hover:shadow-lg transition">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      {chartPlaceholder && (
        <div className="bg-purple-100 h-24 rounded-lg mt-4 flex items-center justify-center text-purple-500 text-sm">
          Chart Placeholder
        </div>
      )}
      {calendarPlaceholder && (
        <div className="bg-blue-100 h-24 rounded-lg mt-4 flex items-center justify-center text-blue-500 text-sm">
          Calendar Placeholder
        </div>
      )}
      {content && <p className="mt-4 text-sm text-gray-600">{content}</p>}
    </div>
  );
};

export default DashboardCard;
