import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarTrigger, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { UserCog, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <UserCog className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Admin Panel</h2>
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <div className="hidden sm:flex items-center gap-2 ml-auto">
                <SidebarTrigger />
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
