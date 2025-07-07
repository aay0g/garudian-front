"use client";

import { AuthGuard, useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen w-full">
        <Sidebar />
        <Header />
        <main className="pt-14 md:pl-[220px] lg:pl-[280px]">
          <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 