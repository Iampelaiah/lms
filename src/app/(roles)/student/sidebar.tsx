
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  BarChart,
  Library,
  Settings,
  LogOut,
  SlidersHorizontal,
  Palette,
  Puzzle,
  HelpCircle,
  Copy,
  Star,
  Bell,
  Plus,
  BrainCircuit,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/courses', icon: BookOpen, label: 'My Courses' },
  { href: '/student/study-panel', icon: BrainCircuit, label: 'Study Panel' },
  { href: '/student/live-classes', icon: Video, label: 'Live Classes' },
  { href: '/student/community', icon: MessageSquare, label: 'Forums' },
  { href: '/student/resources', icon: Library, label: 'Resources' },
  { href: '/student/progress', icon: BarChart, label: 'Progress' },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/101/100/100" alt="Alex Johnson" data-ai-hint="student portrait" />
                <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-xs text-muted-foreground">Welcome back,</span>
                <span className="text-base font-semibold">Alex Johnson</span>
            </div>
            <SidebarTrigger className="ml-auto -translate-x-[5px]" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href !== '/student' || pathname === '/student')}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
         <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Preferences">
                        <SlidersHorizontal />
                        <span>Preferences</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Appearance">
                        <Palette />
                        <span>Appearance</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Plugins">
                        <Puzzle />
                        <span>Plugins</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Help">
                        <HelpCircle />
                        <span>Help</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
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
                        <Button variant="ghost" size="icon"><Star /></Button>
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
