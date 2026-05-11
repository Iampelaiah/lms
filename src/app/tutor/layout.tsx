
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
import { createClient } from '@/lib/supabase/client';
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
  Puzzle,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function TutorSidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = React.useState('Tutor');
  const [userInitials, setUserInitials] = React.useState('T');
  const [avatarUrl, setAvatarUrl] = React.useState("https://picsum.photos/seed/tutor-avatar/100/100");
  const { setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/tutor', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tutor/courses', icon: BookOpenCheck, label: 'My Courses' },
    { href: '/tutor/students', icon: Users, label: 'My Students' },
    { href: '/tutor/assignments', icon: FileText, label: 'Assignments' },
    { href: '/tutor/live-classes', icon: Video, label: 'Live Classes' },
  ];

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const fullName = user.user_metadata?.full_name || 'Tutor';
        const avatar = user.user_metadata?.avatar_url || "https://picsum.photos/seed/tutor-avatar/100/100";
        
        setUserName(fullName);
        setAvatarUrl(avatar);
        
        // Generate initials
        const initials = fullName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
        setUserInitials(initials || 'T');
      }
    };

    fetchUser();
  }, []);

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={avatarUrl}
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
                        <Link href="/tutor/settings"><Button variant="ghost" size="icon"><Settings /></Button></Link>
                        <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut /></Button>
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
