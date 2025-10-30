

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
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';


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

function AccountCreation({ onAccountCreated }: { onAccountCreated: (user: User) => void }) {
  const { toast } = useToast();
  const isFirebaseConfigured = !!auth;

  const handleGoogleSignup = async () => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Firebase not configured',
        description: 'Please check your Firebase configuration and try again.',
      });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email) {
        localStorage.setItem('loggedInUser', user.email);
      }

      toast({
        title: 'Account Created!',
        description: 'Please enter your school details to continue.',
      });
      onAccountCreated(user);
    } catch (error) {
      console.error('Google Sign-up Error: ', error);
      const errorMessage =
        (error as Error).message ||
        'There was a problem with Google Sign-Up. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: errorMessage,
      });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Feature in development',
      description: 'Email signup will be implemented soon. Please use Google Sign-Up.',
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create a School Account</CardTitle>
        <CardDescription>
          Only school administrators can create a new school.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isFirebaseConfigured && (
          <Alert variant="destructive" className="mb-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
              Firebase API Key is invalid or missing. Please check your{' '}
              <code>.env.local</code> file and restart the development server.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" type="text" placeholder="John Doe" required />
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
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Create School Account
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
                  <p>
                    Firebase is not configured. Please check your API keys.
                  </p>
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
  );
}

function SchoolDetailsForm({ user }: { user: User }) {
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const schoolName = formData.get('school-name') as string;
        const schoolMantra = formData.get('school-mantra') as string;
        const numTeachers = formData.get('num-teachers') as string;
        const numAdmins = formData.get('num-admins') as string;

        if (typeof window !== 'undefined') {
            localStorage.setItem('schoolName', schoolName);
            localStorage.setItem('schoolMantra', schoolMantra);
            localStorage.setItem('numTeachers', numTeachers);
            localStorage.setItem('numAdmins', numAdmins);
        }

        toast({
            title: "School Created!",
            description: "Redirecting you to the admin dashboard...",
        });
        router.push('/admin');
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">Set Up Your School</CardTitle>
                <CardDescription>
                    Welcome, {user.displayName}! Let's get your school set up on LearnetIQ.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="school-name">School Name</Label>
                        <Input id="school-name" name="school-name" type="text" placeholder="e.g., Northwood High School" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="school-mantra">School Mantra</Label>
                        <Input id="school-mantra" name="school-mantra" type="text" placeholder="e.g., Fostering lifelong learners" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="num-teachers">Number of Teachers</Label>
                        <Input id="num-teachers" name="num-teachers" type="number" placeholder="e.g., 50" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="num-admins">Number of Admins</Label>
                        <Input id="num-admins" name="num-admins" type="number" placeholder="e.g., 5" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Complete Setup
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function SignupPage() {
  const [step, setStep] = useState<'account' | 'school'>('account');
  const [user, setUser] = useState<User | null>(null);

  const handleAccountCreated = (createdUser: User) => {
    setUser(createdUser);
    setStep('school');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary">
          LearnetIQ
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          The future of personalized learning, powered by AI. Create your
          account to get started.
        </p>
      </div>

      {step === 'account' && <AccountCreation onAccountCreated={handleAccountCreated} />}
      {step === 'school' && user && <SchoolDetailsForm user={user} />}

    </main>
  );
}
