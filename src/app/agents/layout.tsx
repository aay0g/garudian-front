import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout noPadding={true}>{children}</DashboardLayout>;
}
