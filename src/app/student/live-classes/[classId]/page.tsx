'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LiveClassPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
    </div>
  );
}
