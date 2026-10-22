import React from 'react';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[999] h-screen w-screen overflow-hidden bg-[#101112]">
      {children}
    </div>
  );
}
