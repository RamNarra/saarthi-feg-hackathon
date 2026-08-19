import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Activity, Layers, BarChart3, Cpu, Shield, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Saarthi — Real-Time Session Intelligence & Friction Resolution",
  description: "Understand in-session intent, detect behavioral friction, and intervene with minimal useful actions or deliberately do nothing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-100 tracking-tight">
                    <span>Saarthi</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">FEG C1</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono tracking-tight -mt-0.5">Session Intelligence Engine</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                <Link href="/session" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Live Simulator</span>
                </Link>
                <Link href="/analytics" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span>Analytics & A/B</span>
                </Link>
                <Link href="/models" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Models</span>
                </Link>
                <Link href="/architecture" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Architecture</span>
                </Link>
                <Link href="/about" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Responsible AI</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Decision Engine Active</span>
              </div>
              <Link
                href="/session"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Demo</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 bg-slate-950/80 py-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Saarthi</span>
              <span>— Real-Time Session Intelligence & Friction Resolution</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              Built for FEG Innovation Hackathon 2026 • Challenge 1
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
