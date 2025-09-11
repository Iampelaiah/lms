'use client';

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
  Video,
  Copy,
  Star,
  Bell,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';


function TutorSidebar() {
  const pathname = usePathname();
  const navItems = [
    { href: '/tutor', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tutor/courses', icon: BookOpenCheck, label: 'My Courses' },
    { href: '/tutor/students', icon: Users, label: 'My Students' },
    { href: '/tutor/assignments', icon: FileText, label: 'Assignments' },
    { href: '/tutor/schedule', icon: Calendar, label: 'Schedule' },
    { href: '/tutor/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/tutor/live-classes', icon: Video, label: 'Live Classes' },
  ];

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
            {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                    <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
         <SidebarGroup>
             <SidebarGroupLabel>Account</SidebarGroupLabel>
             <SidebarMenu>
                <SidebarMenuItem>
                    <div className="flex justify-around items-center group-data-[collapsible=icon]:hidden">
                        <Button variant="ghost" size="icon"><Copy /></Button>
                        <Button variant="ghost" size="icon"><MessageCircle /></Button>
                        <Button variant="ghost" size="icon"><Bell /></Button>
                        <Button variant="ghost" size="icon"><Settings /></Button>
                        <Button variant="ghost" size="icon"><LogOut /></Button>
                    </div>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Button className="w-full h-12 mt-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0" asChild>
                        <Link href="#">
                            <Plus className="group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
                            <span className="group-data-[collapsible=icon]:hidden">Create new task</span>
                        </Link>
                    </Button>
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
