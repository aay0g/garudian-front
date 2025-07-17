"use client";

import { clsx } from "clsx";
import { AuthGuard, useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
  noPadding = false,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen w-full">
        <Sidebar />
        <Header />
        <main className="pt-14 md:pl-[220px] lg:pl-[280px]">
          <div
            className={clsx(
              "flex flex-1 flex-col",
              !noPadding && "gap-4 p-4 md:gap-8 md:p-8"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}