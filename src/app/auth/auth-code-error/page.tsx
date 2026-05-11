'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error_description') || 'An unexpected authentication error occurred.';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Auth Error</h1>
          <p className="text-gray-400 text-sm">
            We couldn't sign you in. Here is the detail from the server:
          </p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-4 rounded-xl text-left">
          <p className="text-red-400 font-mono text-xs break-words">
            {error}
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button asChild className="w-full bg-white text-black hover:bg-white/90 rounded-full h-12 font-bold">
            <Link href="/login">Try Again</Link>
          </Button>
          
          <Link href="/" className="text-gray-500 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to landing page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ErrorContent />
    </Suspense>
  );
}
