import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarTrigger,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  User,
  LayoutDashboard,
  BookOpenCheck,
  Users,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Plus,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function TutorSidebar() {
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src="https://picsum.photos/seed/102/100/100"
              alt="Tutor"
              data-ai-hint="teacher portrait"
            />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xs text-muted-foreground">Welcome back,</span>
            <span className="text-base font-semibold">Dr. Evelyn Reed</span>
          </div>
          <SidebarTrigger className="ml-auto -translate-x-[5px]" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/tutor">
                <SidebarMenuButton tooltip="Dashboard" isActive>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="My Courses">
                <BookOpenCheck />
                <span>My Courses</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="My Students">
                <Users />
                <span>My Students</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Assignments">
                <FileText />
                <span>Assignments</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Schedule">
                <Calendar />
                <span>Schedule</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton tooltip="Messages">
                <MessageCircle />
                <span>Messages</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Logout">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <TutorSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
