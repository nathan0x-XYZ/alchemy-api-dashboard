'use client';

import { ReactNode } from 'react';

interface ScreenLayoutProps {
  children: ReactNode;
}

export default function ScreenLayout({ children }: ScreenLayoutProps) {
  return (
    <div className="w-[375px] h-[812px] mx-auto bg-white dark:bg-gray-900 rounded-[60px] shadow-2xl overflow-hidden relative">
      {/* Status Bar */}
      <div className="h-6 bg-black/10 dark:bg-white/10" />
      
      {/* Dynamic Island / Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[32px] bg-black dark:bg-gray-950 rounded-b-[24px]" />
      
      {/* Content Area */}
      <div className="h-[calc(812px-24px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
