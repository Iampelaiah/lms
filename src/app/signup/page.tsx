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
        <CardDescription>Create your admin account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Personal Email (backup mail)</Label>
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
            Create Account
          </Button>
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

function Step2({ onComplete }: { onComplete: () => void }) {
    const handleSetup = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd save the school setup details.
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
                        <Label htmlFor="school-website">School Website</Label>
                        <Input id="school-website" type="url" placeholder="https://springfieldu.edu" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="school-country">Country</Label>
                        <Input id="school-country" type="text" placeholder="USA" required />
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

  const handleNext = () => setStep(2);

  const handleComplete = () => {
    // For now, we'll just redirect to the login page.
    router.push('/login');
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
      <Card className="w-full max-w-md">
        {step === 1 && <Step1 onNext={handleNext} />}
        {step === 2 && <Step2 onComplete={handleComplete} />}
      </Card>
    </main>
  );
}
