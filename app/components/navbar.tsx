"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Activity, Layers, BarChart2, ShieldCheck, Terminal, Compass, TrendingUp } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Simulator", href: "/session", icon: Activity },
    { name: "Architecture", href: "/architecture", icon: Layers },
    { name: "Decision Engine", href: "/models", icon: Compass },
    { name: "Business Impact", href: "/impact", icon: TrendingUp },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "About", href: "/about", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/75 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tight text-lg leading-tight flex items-center gap-1.5">
                Saarthi <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">v2.0</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wide">
                Session Decision Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">API Live</span>
            </div>
            <Link
              href="/session"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/10 transition-all duration-200"
            >
              Launch Simulator
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
