'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, GraduationCap, Briefcase, Shield, UserCog, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { handleSignUp } from '@/app/auth/actions';
import { createClient } from '@/lib/supabase/client';

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

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAction = async (formData: FormData) => {
    setIsLoading(true);
    formData.append('role', role);
    
    const result = await handleSignUp(formData);
    
    if (result?.error) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: result.error,
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Account Created!',
        description: `Welcome to Dr Max online school as a ${role}. Please check your email for verification.`,
      });
      router.push(`/${role}`);
    }
  };

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

  const handleWhatsAppLogin = async () => {
    toast({
      title: 'WhatsApp Login',
      description: 'Please use the login page for WhatsApp OTP authentication.',
    });
  };

  return (
    <main className="h-screen grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] bg-black overflow-hidden">
      {/* Left Column - Decorative & Progress */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#0A2E2E] via-[#051C1C] to-black p-10 flex-col justify-between overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00FFCC]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#00FFCC]/5 rounded-full blur-[120px]" />
        
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
          {[
            { id: 'student', name: 'Student', icon: GraduationCap },
            { id: 'tutor', name: 'Tutor', icon: Briefcase },
            { id: 'parent', name: 'Parent', icon: Shield },
            { id: 'admin', name: 'Admin', icon: UserCog },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`relative rounded-[1.5rem] p-3 flex flex-col justify-between h-28 transition-all duration-200 text-left overflow-hidden ${
                role === r.id 
                ? 'bg-[#00FFCC]/10 border border-[#00FFCC] shadow-[0_0_15px_rgba(0,255,204,0.2)] ring-1 ring-[#00FFCC] scale-105' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs relative z-10 ${
                role === r.id ? 'bg-[#00FFCC] text-black' : 'bg-white/20 text-white'
              }`}>
                <r.icon className="w-3.5 h-3.5" />
              </div>
              <div className="relative z-10">
                <p className={`font-bold text-xs leading-snug ${
                  role === r.id ? 'text-white' : 'text-white/40'
                }`}>
                  Sign up as <br /> {r.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex items-center justify-center p-6 lg:p-10 bg-black overflow-y-auto">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">Sign Up Account</h2>
            <p className="text-gray-500 text-xs">Enter your personal data to create your account.</p>
          </div>

          <div className="space-y-3">
            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="bg-transparent border-[#2A2A2A] hover:bg-white/5 text-white h-10 rounded-xl flex gap-3 font-medium"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <GoogleIcon className="w-5 h-5" />
                Google
              </Button>
              <Button 
                variant="outline" 
                className="bg-transparent border-[#2A2A2A] hover:bg-white/5 text-white h-10 rounded-xl flex gap-3 font-medium"
                onClick={handleWhatsAppLogin}
                disabled={isLoading}
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

            <form action={handleAction} className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-white text-xs font-medium">First Name</Label>
                  <Input
                    id="first-name"
                    name="first-name"
                    placeholder="eg. John"
                    className="bg-[#1A1A1A] border-none text-white h-10 rounded-xl placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-white/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-white text-xs font-medium">Last Name</Label>
                  <Input
                    id="last-name"
                    name="last-name"
                    placeholder="eg. Francisco"
                    className="bg-[#1A1A1A] border-none text-white h-10 rounded-xl placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-white/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-xs font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="eg. johnfrans@gmail.com"
                  className="bg-[#1A1A1A] border-none text-white h-10 rounded-xl placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-white/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="Must be at least 8 characters" className="text-white text-xs font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="bg-[#1A1A1A] border-none text-white h-10 rounded-xl placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-white/20 pr-10"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-[10px] text-gray-600">Must be at least 8 characters.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-select" className="text-white text-xs font-medium">I am a...</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role-select" className="bg-[#1A1A1A] border-none text-white h-10 rounded-xl focus:ring-1 focus:ring-white/20">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectItem value="student" className="focus:bg-white/10 focus:text-white">Student</SelectItem>
                    <SelectItem value="tutor" className="focus:bg-white/10 focus:text-white">Tutor</SelectItem>
                    <SelectItem value="parent" className="focus:bg-white/10 focus:text-white">Parent</SelectItem>
                    <SelectItem value="admin" className="focus:bg-white/10 focus:text-white">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-white/90 h-10 rounded-full font-bold text-sm mt-4"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Up'}
              </Button>
            </form>

            <div className="text-center text-xs">
              <span className="text-gray-500">Already have an account? </span>
              <Link href="/login" className="text-white font-bold hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
