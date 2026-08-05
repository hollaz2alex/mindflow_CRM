import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

export default function CRMLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar — fixed 256px */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-100 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-bold">MindFlow</span>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile slide-out drawer + overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/40 transition-opacity',
            drawerOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-64 border-r border-gray-100 bg-white shadow-xl transition-transform',
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute right-3 top-4 rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
