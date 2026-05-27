import { StudentSidebar } from '@/components/app/student/sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Suspense } from 'react';
import { PreviewBanner } from '@/components/app/preview-banner';

// Student layout renders the shell (sidebar + inset). No server-side DB calls here,
// so we do NOT force-dynamic — Next.js can cache the layout shell normally.
// Individual page components handle their own data fetching client-side.

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <StudentSidebar />
        <SidebarInset>
          <PreviewBanner />
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <SidebarTrigger className="sm:hidden" />
          </header>
          <main className="flex-1 p-4 sm:p-6"><Suspense>{children}</Suspense></main>
        </SidebarInset>
      </SidebarProvider>
  );
}
