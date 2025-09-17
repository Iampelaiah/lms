
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
  Settings,
  LogOut,
  Plus,
  Video,
  Star,
  Bell,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import React from 'react';


function TutorSidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = React.useState('Tutor');
  const [userInitials, setUserInitials] = React.useState('T');

  const navItems = [
    { href: '/tutor', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tutor/courses', icon: BookOpenCheck, label: 'My Courses' },
    { href: '/tutor/students', icon: Users, label: 'My Students' },
    { href: '/tutor/assignments', icon: FileText, label: 'Assignments' },
    { href: '/tutor/live-classes', icon: Video, label: 'Live Classes' },
  ];

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('loggedInUser');
      if (email) {
        const namePart = email.split('@')[0];
        try {
          let nameGuess = 'Tutor';
          let initials = 'T';
          // Very basic name parsing from email
          if (namePart.includes('.')) {
            const parts = namePart.split('.');
            const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
            const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
            nameGuess = `${firstName} ${lastName}`;
            initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
          } else {
             nameGuess = namePart.charAt(0).toUpperCase() + namePart.slice(1);
             const nameParts = nameGuess.split(' ');
             if (nameParts.length > 1) {
                initials = `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`;
             } else {
                initials = nameGuess.substring(0, 2).toUpperCase();
             }
          }
          if (email.includes('ereed')) nameGuess = `Dr. ${nameGuess}`;

          setUserName(nameGuess);
          setUserInitials(initials);
        } catch (e) {
          // fallback
          setUserName('Tutor');
          setUserInitials('T');
        }
      }
    }
  }, []);

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
                        <Button variant="ghost" size="icon"><HelpCircle /></Button>
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
