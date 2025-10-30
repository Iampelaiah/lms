
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Link2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function Step1({ onNext }: { onNext: () => void }) {
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle account creation here.
    onNext();
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>First, create your school's primary admin account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="invite-link">Join with Invite Link</Label>
            <div className="flex gap-2">
                <Input id="invite-link" type="url" placeholder="Paste invite link..." />
                <Button variant="secondary" type="submit" size="icon">
                    <Link2 className="h-4 w-4" />
                </Button>
            </div>
          </div>
          
          <div className="my-4 flex items-center">
              <Separator className="flex-1" />
              <span className="mx-4 text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={onNext}>
            Sign Up with Email
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Only school administrators can create a new school account.
          </p>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </>
  );
}

function GoogleIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px" {...props}>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.472-11.303-8H6.306C9.656,39.663,16.318,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.846,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    )
}

function EmailSignupStep({ onNext, onBack }: { onNext: () => void; onBack: () => void; }) {
    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would create the user in Firebase Auth
        onNext();
    };

    return (
        <>
            <CardHeader>
                <CardTitle className="text-2xl">Create Admin Account</CardTitle>
                <CardDescription>Enter your details to register your school.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" type="text" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Work Email</Label>
                        <Input id="email" type="email" placeholder="admin@school.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">Create Account & Continue</Button>
                </form>

                <div className="my-4 flex items-center">
                    <Separator className="flex-1" />
                    <span className="mx-4 text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full" disabled>
                          <GoogleIcon className="h-5 w-5 mr-2" />
                          Sign Up with Google
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Google Sign-Up is coming soon!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="link" onClick={onBack} className="mt-4 px-0">Back</Button>
            </CardContent>
        </>
    );
}

function SchoolSetupStep({ onComplete }: { onComplete: () => void }) {
    const handleSetup = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would trigger the Cloud Function to create the school.
        onComplete();
    };

    return (
        <>
            <CardHeader>
                <CardTitle className="text-2xl">Set Up Your School</CardTitle>
                <CardDescription>Provide some details about your institution.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSetup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="school-name">School Name</Label>
                        <Input id="school-name" type="text" placeholder="Springfield University" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="school-logo">School Logo</Label>
                        <Input id="school-logo" type="file" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="school-mantra">School Mantra</Label>
                        <Textarea id="school-mantra" placeholder="e.g., 'Excellence and Integrity'" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="student-count">Number of Students</Label>
                        <Select>
                            <SelectTrigger id="student-count">
                                <SelectValue placeholder="Select a range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-500">1-500</SelectItem>
                                <SelectItem value="501-2000">501-2,000</SelectItem>
                                <SelectItem value="2001-10000">2,001-10,000</SelectItem>
                                <SelectItem value="10001+">10,001+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="teacher-count">Number of Teachers</Label>
                        <Select>
                            <SelectTrigger id="teacher-count">
                                <SelectValue placeholder="Select a range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-50">1-50</SelectItem>
                                <SelectItem value="51-200">51-200</SelectItem>
                                <SelectItem value="201-500">201-500</SelectItem>
                                <SelectItem value="501+">501+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-count">Number of Admins</Label>
                        <Select>
                            <SelectTrigger id="admin-count">
                                <SelectValue placeholder="Select a range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-10">1-10</SelectItem>
                                <SelectItem value="11-50">11-50</SelectItem>
                                <SelectItem value="51-100">51-100</SelectItem>
                                <SelectItem value="101+">101+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full">
                        Complete Setup
                    </Button>
                </form>
            </CardContent>
        </>
    )
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleComplete = () => {
    // For now, we'll just redirect to the admin dashboard.
    router.push('/admin');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 onNext={handleNext} />;
      case 2:
        return <EmailSignupStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <SchoolSetupStep onComplete={handleComplete} />;
      default:
        return <Step1 onNext={handleNext} />;
    }
  }

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
      <Card className="w-full max-w-md">
        {renderStep()}
      </Card>
    </main>
  );
}

    