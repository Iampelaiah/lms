
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
import React from 'react';
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/study-panel', icon: BrainCircuit, label: 'Study Panel' },
  { href: '/student/live-classes', icon: Video, label: 'Live Classes' },
  { href: '/student/community', icon: MessageSquare, label: 'Forums' },
  { href: '/student/resources', icon: Library, label: 'Resources' },
  { href: '/student/progress', icon: BarChart, label: 'Progress' },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = React.useState('Student');
  const [userInitials, setUserInitials] = React.useState('S');
  const { setTheme } = useTheme()

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('loggedInUser');
      if (email) {
        const namePart = email.split('@')[0]; // e.g., 'pngarande'
        try {
          // Attempt to construct a name
          const initial = namePart.charAt(0).toUpperCase();
          const rest = namePart.slice(1);
          let lastName = '';
          // simple logic to find separation of first and last name
          for(let i=0; i<rest.length; i++) {
              if (rest.charCodeAt(i) >= 65 && rest.charCodeAt(i) <= 90) { // is uppercase
                  lastName = rest.slice(i);
                  break;
              }
          }
          if (!lastName) { // find numbers
              for(let i=0; i<rest.length; i++) {
                  if (rest.charCodeAt(i) >= 48 && rest.charCodeAt(i) <= 57) { // is number
                      lastName = rest.slice(i);
                      break;
                  }
              }
          }

          let firstName = rest.replace(lastName, '');
          firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
          lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
          
          if (firstName && lastName) {
            setUserName(`${firstName} ${lastName}`);
            setUserInitials(`${firstName.charAt(0)}${lastName.charAt(0)}`);
          } else {
             const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
             setUserName(formattedName);
             setUserInitials(formattedName.substring(0,2).toUpperCase());
          }
          
        } catch (e) {
          // Fallback if name parsing fails
          setUserName('Student');
          setUserInitials('S');
        }
      }
    }
  }, []);

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/101/100/100" alt="Alex Johnson" data-ai-hint="student portrait" />
                <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-xs text-muted-foreground">Welcome back,</span>
                <span className="text-base font-semibold">{userName}</span>
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                    <div className="flex justify-around items-center group-data-[collapsible=icon]:hidden">
                        <Link href="#"><Button variant="ghost" size="icon"><HelpCircle /></Button></Link>
                        <Link href="#"><Button variant="ghost" size="icon"><Puzzle /></Button></Link>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                <Palette />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="mb-2">
                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href="#"><Button variant="ghost" size="icon"><Settings /></Button></Link>
                        <Link href="/login"><Button variant="ghost" size="icon"><LogOut /></Button></Link>
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
