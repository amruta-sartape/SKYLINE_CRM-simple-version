import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export const AppLayout = ({ activeTab, onSelectTab, tabLabelMap = {}, children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-150">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <TopHeader
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          activeTabName={tabLabelMap[activeTab] || 'Dashboard'}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
