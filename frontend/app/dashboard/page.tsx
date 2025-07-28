"use client";

import { createSwapy } from "swapy";
import { useEffect, useRef } from "react";
import DashboardCard from "@/components/DashboardCard";

interface SwapyInstance {
  onSwap: (handler: (event: any) => void) => void;
  destroy: () => void;
}

export default function Home() {
  const swapy = useRef<SwapyInstance | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (container.current) {
      swapy.current = createSwapy(container.current);

      swapy.current.onSwap((event: { from: string; to: string }) => {
        console.log("swap", event);
      });
    }

    return () => {
      swapy.current?.destroy();
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Good morning, <span className="font-bold">User</span>
        </h1>
      </div>

      <div
        ref={container}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6"
      >
        {widgets.map((widget) => (
          <div 
            key={widget.id} 
            data-swapy-slot={widget.id}
            className="min-h-[200px] cursor-grab active:cursor-grabbing"
          >
            <div 
              data-swapy-item={widget.id}
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