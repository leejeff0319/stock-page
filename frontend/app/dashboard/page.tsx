"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { getCurrentUser } from "@/lib/actions/user.actions";

export default function Home() {
  const widgets = [
    {
      id: "a",
      title: "Current Spend",
      subtitle: "You've spent $1,416 more than last month.",
      content: "Payday in 9 days",
      chartPlaceholder: true
    },
    {
      id: "b",
      title: "Upcoming Charges",
      subtitle: "You have 0 recurring charges due within the next 10 days.",
      content: "View full schedule",
      calendarPlaceholder: true
    },
    {
      id: "c",
      title: "Contact Speed",
      subtitle: "Drive user 1 full-time drive last month.",
      content: "User Interface\nUser Interface\nUser Interface"
    },
    {
      id: "d",
      title: "Location",
      content: "Statistics\nStocks\nPortable\nEndload\nBiltinger\nSettings\nUser"
    },
    {
      id: "e",
      title: "Performance Metrics",
      chartPlaceholder: true
    },
    {
      id: "f",
      title: "Recent Activity",
      content: "5 new notifications\n3 pending requests"
    }
  ];

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Good morning, <span className="font-bold">{user?.firstName || 'User'}</span>
        </h1>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6"
      >
        {widgets.map((widget) => (
          <div 
            key={widget.id} 
            className="min-h-[200px]"
          >
            <div 
              className="h-full"
            >
              <DashboardCard
                title={widget.title}
                subtitle={widget.subtitle}
                content={widget.content}
                chartPlaceholder={widget.chartPlaceholder}
                calendarPlaceholder={widget.calendarPlaceholder}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
