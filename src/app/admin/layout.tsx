
'use client';
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarTrigger, SidebarProvider, SidebarInset, SidebarFooter, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { UserCog, LayoutDashboard, Folder, Calendar, Mail, Bell, BarChart, Settings, Plus, Star, Copy, Slack, CircleHelp, LogOut, GraduationCap, Users, ShieldCheck, CreditCard, UserCheck, SlidersHorizontal, Palette, Puzzle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';


function AdminSidebar() {
  const [userName, setUserName] = React.useState('Admin User');
  const [userInitial, setUserInitial] = React.useState('AD');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('loggedInUser');
      if (email) {
        // e.g. pngarande@northwood.lq.zw -> Pelaiah Ngarande
        const namePart = email.split('@')[0];
        const initial = namePart.charAt(0);
        const surname = namePart.substring(1);
        const fullName = `${initial.toUpperCase()}${surname.charAt(0).toUpperCase()}${surname.slice(1)}`;
        
        let formattedName = 'User';
        let formattedInitial = 'U';
        try {
            const firstChar = namePart.charAt(0).toUpperCase();
            const lastName = namePart.charAt(1).toUpperCase() + namePart.slice(2);
            // This is a rough guess, you might want a more robust name parser
            const nameGuess = `${firstChar}. ${lastName}`;
            const initials = `${firstChar}${lastName.charAt(0)}`;
             if (email.includes('p.ngarande')) {
                formattedName = 'Pelaiah N.';
                formattedInitial = 'PN';
            } else if (email.includes('j.smith')) {
                formattedName = 'John S.';
                formattedInitial = 'JS';
            } else {
                 formattedName = nameGuess;
                 formattedInitial = initials;
            }

        } catch (e) {
            // fallback
        }
        setUserName(formattedName);
        setUserInitial(formattedInitial);

      }
    }
  }, []);

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/admin-avatar/100/100" alt="Admin" data-ai-hint="person portrait" />
                <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-xs text-muted-foreground">Good Day 👋</span>
                <span className="text-base font-semibold">{userName}</span>
            </div>
            <SidebarTrigger className="ml-auto -translate-x-[5px]" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/admin">
                    <SidebarMenuButton tooltip="Dashboard">
                        <LayoutDashboard />
                        <span>Dashboard</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/admin/tutors">
                    <SidebarMenuButton tooltip="Tutors">
                      <GraduationCap />
                      <span>Tutors</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/admin/students">
                    <SidebarMenuButton tooltip="Students">
                      <Users />
                      <span>Students</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/admin/admins">
                    <SidebarMenuButton tooltip="Admins">
                      <UserCog />
                      <span>Admins</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/admin/validations">
                    <SidebarMenuButton tooltip="Validations">
                      <ShieldCheck />
                      <span>Validations</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/admin/billing">
                    <SidebarMenuButton tooltip="Billing">
                      <CreditCard />
                      <span>Billing</span>
                    </SidebarMenuButton>
                </Link>
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
                        <Button variant="ghost" size="icon"><HelpCircle /></Button>
                        <Button variant="ghost" size="icon"><Puzzle /></Button>
                        <Link href="#">
                            <Button variant="ghost" size="icon"><Settings /></Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="ghost" size="icon"><LogOut /></Button>
                        </Link>
                    </div>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Button className="w-full h-12 mt-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0" asChild>
                        <Link href="/admin/tutors">
                            <Plus className="group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
                            <span className="group-data-[collapsible=icon]:hidden">New Invitation</span>
                        </Link>
                    </Button>
                </SidebarMenuItem>
             </SidebarMenu>
         </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
