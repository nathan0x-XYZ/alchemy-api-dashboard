import React from 'react';

interface ScreenLayoutProps {
  children: React.ReactNode;
}

export default function ScreenLayout({ children }: ScreenLayoutProps) {
  return (
    <div className="w-full max-w-[375px] mx-auto min-h-[812px] bg-gray-950 overflow-hidden">
      {children}
    </div>
  );
}
