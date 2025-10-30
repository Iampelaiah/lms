
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
import { Link2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle account creation here.
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
        <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Join an existing school or create a new one.</CardDescription>
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

            <Button type="button" variant="outline" className="w-full">
                Sign Up with Email to Create a School
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
      </Card>
    </main>
  );
}
