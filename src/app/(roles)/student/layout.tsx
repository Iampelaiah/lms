import { StudentSidebar } from '@/components/app/student/sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
