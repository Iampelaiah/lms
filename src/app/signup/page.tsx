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
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const isFirebaseConfigured = !!auth;
  const [role, setRole] = useState('student');

  useEffect(() => {
    if (!auth) return;

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const user = result.user;
          if (user.email) {
            localStorage.setItem('loggedInUser', user.email);
          }
          const savedRole = localStorage.getItem('signupRole') || 'admin';
          toast({
            title: 'Account Created!',
            description: `Welcome to Dr Max online school as a ${savedRole}.`,
          });
          router.push(`/${savedRole}`);
        }
      })
      .catch((error) => {
        console.error('Google Redirect Error: ', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description:
            error.message || 'There was a problem with Google Sign-In.',
        });
      });
  }, [auth, toast, router]);

  const handleGoogleSignup = async () => {
    if (!auth) return;
    localStorage.setItem('signupRole', role);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Feature in development',
      description: 'Email signup is coming soon. Please use Google Sign-Up.',
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <div className="flex flex-col items-center gap-0">
          <div className="flex items-center gap-2">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary">
              Dr Max
            </h1>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground -mt-1 ml-12">
            Online school
          </span>
        </div>
        <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to the Dr Max online school portal. Sign up to get started.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join the Dr Max digital community.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isFirebaseConfigured && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Firebase is not correctly configured. Please check your
                environment variables.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
          <div className="my-4 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div tabIndex={0}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={handleGoogleSignup}
                      disabled={!isFirebaseConfigured}
                    >
                      <GoogleIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isFirebaseConfigured && (
                  <TooltipContent>
                    <p>Firebase is not configured.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
