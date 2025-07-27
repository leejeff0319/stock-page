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

  return (
    <div>
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Good morning, <span className="font-bold">User</span>
        </h1>
      </div>

      <div
        ref={container}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div data-swapy-slot="a">
          <div data-swapy-item="a">
            <DashboardCard
              title="Current Spend"
              subtitle="You've spent $1,416 more than last month."
              content="Payday in 9 days"
              chartPlaceholder
            />
          </div>
        </div>

        <div data-swapy-slot="b">
          <div data-swapy-item="b">
            <DashboardCard
              title="Upcoming Charges"
              subtitle="You have 0 recurring charges due within the next 10 days."
              content="View full schedule"
              calendarPlaceholder
            />
          </div>
        </div>
      
        
      </div>
    </div>
  );
}