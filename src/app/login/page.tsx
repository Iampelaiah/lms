'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { GraduationCap, Briefcase, Shield, UserCog, Eye, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { login } from '@/app/auth/actions';

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      fill="currentColor"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.636,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

function capitalizeFirstLetter(string: string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const roleDisplayNames: Record<string, string> = {
    student: 'Student',
    tutor: 'Tutor',
    parent: 'Parent',
    admin: 'School Admin'
};

const roles = [
  { id: 'student', name: 'Student', icon: GraduationCap },
  { id: 'tutor', name: 'Tutor', icon: Briefcase },
  { id: 'parent', name: 'Parent', icon: Shield },
  { id: 'admin', name: 'Admin', icon: UserCog },
];

const roleImagePositions: Record<string, string> = {
  tutor: '0%',
  parent: '33.33%',
  admin: '66.66%',
  student: '100%',
};

export default function LoginPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      setErrorMessage(error);
      // Remove error from URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (message) {
      toast({
        title: 'Success',
        description: message,
      });
      // Optionally remove message from URL too
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, toast]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${role}`,
        data: {
          role: role,
        },
      },
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Google Login failed',
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('role', role);
    
    const result = await login(formData);
    
    if (result?.error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: result.error,
      });
      setIsLoading(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    router.push(`/login/${newRole}`);
  };

  const displayRole = roleDisplayNames[role] || capitalizeFirstLetter(role);

  return (
    <main className="h-screen grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] bg-black overflow-hidden">
      {/* Left Column */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#0A2E2E] via-[#051C1C] to-black p-10 flex-col justify-between overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00FFCC]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#00FFCC]/5 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">Dr Max</h2>
          </div>
          <div className="space-y-4 max-w-md mt-6">
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Welcome <br /> Back
            </h1>
            <p className="text-gray-400 text-sm">
              The future of personalized learning, powered by AI. Select your role to access your workspace.
            </p>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="relative z-10 grid grid-cols-4 gap-3">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRoleChange(r.id)}
              className={`relative rounded-[1.5rem] p-3 flex flex-col justify-between h-28 transition-all duration-200 text-left overflow-hidden ${
                role === r.id
                  ? 'bg-[#00FFCC]/10 border border-[#00FFCC] shadow-[0_0_15px_rgba(0,255,204,0.2)] ring-1 ring-[#00FFCC] scale-105 z-20'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src="/roles-composite.png"
                  alt={r.name}
                  fill
                  className="object-cover"
                  style={{ objectPosition: `${roleImagePositions[r.id]} 0%` }}
                  priority
                />
                {/* Overlay to ensure text readability or active state tint */}
                <div className={`absolute inset-0 transition-opacity duration-200 ${
                  role === r.id ? 'bg-[#00FFCC]/10' : 'bg-black/40'
                }`} />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg ${
                  role === r.id ? 'bg-[#00FFCC] text-black' : 'bg-white/20 text-white'
                }`}>
                  <r.icon className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <p className={`font-bold text-sm leading-snug drop-shadow-md ${
                    role === r.id ? 'text-white' : 'text-white/60'
                  }`}>
                    Sign in as <br /> {r.name}
                  </p>
                  <Link
                    href={`/${r.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors drop-shadow-sm ${
                      role === r.id ? 'text-[#00FFCC] hover:text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    <span>Preview Portal</span>
                  </Link>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex items-center justify-center p-6 lg:p-10 bg-black overflow-y-auto">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">Login as {displayRole}</h2>
            <p className="text-gray-500 text-xs">Enter your credentials to access your account.</p>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="bg-transparent border-[#2A2A2A] hover:bg-white/5 text-white h-10 rounded-xl flex gap-3 font-medium"
                onClick={handleGoogleLogin}
                disabled={!mounted}
              >
                <GoogleIcon className="w-5 h-5" />
                Google
              </Button>
              <Button 
                variant="outline" 
                className="bg-transparent border-[#2A2A2A] hover:bg-white/5 text-white h-10 rounded-xl flex gap-3 font-medium"
                onClick={() => window.open('https://wa.me/yournumber', '_blank')}
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                WhatsApp
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#2A2A2A]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-500">Or</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-xs font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="eg. m@example.com"
                  className="bg-[#1A1A1A] border-none text-white h-10 rounded-xl placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-white/20"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-white text-xs font-medium">Password</Label>
                  <Link href="#" className="text-[#00FFCC] text-[10px] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="bg-[#1A1A1A] border-none text-white h-10 rounded-xl placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-white/20 pr-10"
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-white/90 h-10 rounded-full font-bold text-sm mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#2A2A2A]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-500">Or</span>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent border-[#2A2A2A] hover:bg-white/5 text-white h-10 rounded-xl font-medium" asChild>
              <Link href="/signup">Create New Account</Link>
            </Button>

            <div className="text-center text-xs pt-4">
              <Link href="/" className="text-gray-500 hover:text-white flex items-center justify-center gap-2 transition-colors">
                <ArrowLeft className="w-3 h-3" />
                Back to landing page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
