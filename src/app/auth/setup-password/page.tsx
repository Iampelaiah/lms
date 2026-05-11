'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updatePassword } from '@/app/auth/actions';
import { Shield, Key, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function SetupPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result?.error) {
      toast({
        variant: 'destructive',
        title: 'Setup failed',
        description: result.error,
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Account Secured!',
        description: 'Your password has been set. Welcome to Dr Max!',
      });
      // Redirect to the actual dashboard
      router.push(`/${role}`);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00FFCC]/10 text-[#00FFCC] mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Secure Your Account</h1>
        <p className="text-gray-400">
          Welcome! Since you signed up with Google, please set a password to enable email login in the future.
        </p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="space-y-6 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#00FFCC] mb-2">
            <Key className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Create Password</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" title="Must be at least 8 characters" className="text-white text-xs font-medium">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              className="bg-[#1A1A1A] border-none text-white h-12 rounded-xl placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-white/20"
              required
              minLength={8}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-[#00FFCC] text-black hover:bg-[#00FFCC]/90 h-14 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,255,204,0.3)]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Securing...</span>
            </div>
          ) : (
            'Complete Setup & Enter Dashboard'
          )}
        </Button>
      </motion.form>

      <p className="text-center text-xs text-gray-500">
        By completing this setup, you agree to our terms and conditions.
      </p>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00FFCC]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00FFCC]/5 rounded-full blur-[120px]" />

      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SetupPasswordForm />
      </Suspense>
    </main>
  );
}
