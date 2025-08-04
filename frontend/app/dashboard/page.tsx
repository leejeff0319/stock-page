"use client";

import { createSwapy } from "swapy";
import { useEffect, useRef, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import TransactionsCard from "@/components/TransactionsCard"; 
import NetWorthCard from "@/components/NetWorthCard"; 

interface SwapyInstance {
  onSwap: (handler: (event: any) => void) => void;
  destroy: () => void;
}

export default function Home() {
  const swapy = useRef<SwapyInstance | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const [showFinancialCards, setShowFinancialCards] = useState(false);

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
      title: "Net Worth", // Replaced Location with Net Worth
      component: <NetWorthCard /> // Using the new component
    },
    {
      id: "e",
      title: "Performance Metrics",
      chartPlaceholder: true
    },
    {
      id: "f",
      title: "Recent Transactions", // Replaced Recent Activity
      component: <TransactionsCard /> // Using the new component
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Good morning, <span className="font-bold">User</span>
        </h1>
        
        {/* Toggle for financial cards - optional */}
        <button 
          onClick={() => setShowFinancialCards(!showFinancialCards)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md w-fit"
        >
          {showFinancialCards ? 'Hide Financial Overview' : 'Show Financial Overview'}
        </button>
      </div>

      {/* Financial Overview Section - Optional */}
      {showFinancialCards && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
          <NetWorthCard />
          <TransactionsCard />
        </div>
      )}

      {/* Main Swapy Grid */}
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
              {widget.component ? (
                widget.component
              ) : (
                <DashboardCard
                  title={widget.title}
                  subtitle={widget.subtitle}
                  content={widget.content}
                  chartPlaceholder={widget.chartPlaceholder}
                  calendarPlaceholder={widget.calendarPlaceholder}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}