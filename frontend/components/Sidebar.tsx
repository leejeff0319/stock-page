'use client';

import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  FC,
} from "react";
import {
  ChevronFirst,
  ChevronLast,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarContextType = {
  expanded: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

type SidebarProps = {
  children: ReactNode;
};

const Sidebar: FC<SidebarProps> = ({ children }) => {
  const [expanded, setExpanded] = useState(true);
  return (

    <aside className="sticky top-0 h-screen overflow-y-auto flex-shrink-0">
      <nav className="h-full flex flex-col bg-gray-900 border-r shadow-sm text-white">
        <div className="p-4 pb-2 flex justify-between items-center sticky top-0 bg-gray-900 z-10">

          <img
            src="https://img.logoipsum.com/243.svg"
            className={`overflow-hidden transition-all ${
              expanded ? "w-32" : "w-0"
            }`}
            alt=""
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t flex p-3">
          <img
            src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
            alt=""
            className="w-10 h-10 roudned-md"
          />
          <div
            className={`
                    flex justify-between items-center
                    overflow-hidden transition-all ${
                      expanded ? "w-52 ml-3" : "w-0"
                    }
                `}
          >
            <div>
              <h4 className="font-semibold">John Doe</h4>
              <span className="text-xs text-gray-600">johndoe@gmail.com</span>
            </div>
            <MoreVertical size={20} />
          </div>
        </div>
      </nav>
    </aside>
  );
};

type SidebarItemProps = {
  icon: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  href: string;
};

export const SidebarItem: FC<SidebarItemProps> = ({
  icon,
  text,
  alert = false,
  href,
}) => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("SidebarItem must be used within a SidebarProvider");
  }

  const { expanded } = context;
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref>
      <li
        className={`
            relative flex items-center py-2 px-3 my-1
            font-medium rounded-md cursor-pointer
            transition-colors group text-white
            ${
              isActive
                ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                : "hoverLbg-indigo-50 text-gray-600"
            }
        `}
      >
        {icon}
        <span
          className={`
                    overflow-hidden transition-all ${
                      expanded ? "w-52 ml-3" : "w-0"
                    }
                `}
        >
          {text}
        </span>
        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded bg-indigo-400
            ${expanded ? "" : "top-2"}`}
          />
        )}

        {expanded && (
          <div
            className={`
      absolute left-full rounded-md px-2 py-1 ml-6
      bg-indigo-100 text-indigo-800 text-sm
      invisible opacity-20 -transalte-x-3 transition-all
      group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
          >
            {text}
          </div>
        )}
      </li>
    </Link>
  );
};

export default Sidebar;
