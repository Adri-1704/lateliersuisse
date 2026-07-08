"use client";

import { useState } from "react";
import { MerchantSidebar } from "./MerchantSidebar";
import { MerchantHeader } from "./MerchantHeader";

export function MerchantLayoutClient({
  children,
  email,
  restaurantName,
}: {
  children: React.ReactNode;
  email: string;
  restaurantName?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <MerchantSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MerchantHeader
          email={email}
          restaurantName={restaurantName}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
