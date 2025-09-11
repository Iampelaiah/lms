import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarTrigger, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Briefcase, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { PlaceholderDashboard } from '@/components/app/placeholder-dashboard';

function TutorSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Tutor Portal</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <TutorSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
