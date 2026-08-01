'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileCheck2, 
  Upload, 
  Film, 
  MessageSquareWarning, 
  ExternalLink, 
  LogOut 
} from 'lucide-react';
import { useShortFilm } from '@/context/ShortFilmContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { pendingFilms, isAdminAuthenticated, logoutAdmin, isLoaded, activePersona } = useShortFilm();

  React.useEffect(() => {
    if (isLoaded && pathname !== '/admin/login') {
      if (!isAdminAuthenticated || activePersona?.role !== 'admin') {
        router.push('/login?redirect=/admin');
      }
    }
  }, [isLoaded, isAdminAuthenticated, activePersona, pathname, router]);

  // If on login page, render children directly
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5]">{children}</div>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { 
      label: 'Review Queue', 
      href: '/admin/review', 
      icon: FileCheck2, 
      badge: pendingFilms.length > 0 ? pendingFilms.length : undefined 
    },
    { label: 'Upload Movie', href: '/admin/upload', icon: Upload },
    { label: 'Manage Content', href: '/admin/manage', icon: Film },
    { label: 'Moderation', href: '/admin/moderation', icon: MessageSquareWarning },
  ];

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F5] flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#1F2833] border-b border-[#F4A300]/30 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Admin Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#F4A300] text-[#0B0C10] flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#F5F5F5]">
                  CINESHORT <span className="text-[#F4A300]">ADMIN</span>
                </span>
                <span className="block text-[10px] uppercase font-bold text-gray-400">
                  Control Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Admin Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all relative ${
                    isActive
                      ? 'bg-[#0B0C10] text-[#FFD60A] border border-[#F4A300]/40 font-bold'
                      : 'text-gray-300 hover:bg-[#0B0C10]/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="bg-[#E63946] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="bg-[#0B0C10] hover:bg-[#0B0C10]/80 text-gray-300 hover:text-[#FFD60A] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition-colors"
            >
              <span>Public Feed</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => {
                logoutAdmin();
                router.push('/admin/login');
              }}
              className="p-2 text-gray-400 hover:text-[#E63946] transition-colors"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Admin Nav Sub-bar */}
        <div className="md:hidden flex items-center justify-around border-t border-gray-700/50 mt-3 pt-2 text-[11px] font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 ${
                pathname === item.href ? 'text-[#FFD60A] font-bold' : 'text-gray-400'
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="bg-[#E63946] text-white text-[9px] px-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
