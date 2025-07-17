"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { BookUser, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const dbNavItems = [
    {
      href: '/databases/contacts',
      icon: BookUser,
      label: 'Grievance Contacts',
    },
    // Future databases will be added here
  ];

  return (
    <DashboardLayout noPadding>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <aside className="w-60 flex-shrink-0 border-r bg-card p-4">
                    <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Database Types</h2>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Database Type</span>
            </Button>
          </div>
          <nav className="flex flex-col gap-1">
            {dbNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                    {
                      'bg-muted text-primary': isActive,
                      'text-muted-foreground hover:text-primary': !isActive,
                    }
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
