import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DemoOverlay } from './DemoOverlay';
import { EmergencyOverlay } from './EmergencyOverlay';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-[var(--color-bg)] overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="h-screen pl-0 md:pl-60 pt-16 overflow-y-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </div>
      </main>
      <DemoOverlay />
      <EmergencyOverlay />
    </div>
  );
}
