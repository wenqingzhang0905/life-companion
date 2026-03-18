"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  Flame,
  Watch,
  Lightbulb,
  Music,
  Sun,
  Moon,
} from "lucide-react";

interface SidebarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checkin", label: "Check In", icon: PenSquare },
  { href: "/streaks", label: "Streaks", icon: Flame },
  { href: "/oura", label: "Oura Data", icon: Watch },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/recommendations", label: "For You", icon: Music },
];

export default function Sidebar({ darkMode, onToggleDark }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">✨</span>
          Life Companion
        </h1>
        <p className="text-xs text-muted mt-1">Your digital wellness journey</p>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-foreground hover:bg-surface-hover"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={onToggleDark}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-surface-hover w-full transition-all"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
