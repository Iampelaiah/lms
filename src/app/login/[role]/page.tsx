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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { type UserRole } from '@/lib/types';
import { useState } from 'react';

function capitalizeFirstLetter(string: string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// A simple map to handle the 'school-admin' case.
const roleDisplayNames: Record<string, string> = {
    student: 'Student',
    tutor: 'Tutor',
    parent: 'Parent',
    admin: 'School Admin'
}


export default function RoleLoginPage() {
  const router = useRouter();
  const params = useParams();
  const role = Array.isArray(params.role) ? params.role[0] : params.role;
  const [email, setEmail] = useState('');


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a mock login. In a real app, you'd handle authentication.
    // We'll store the "logged in" user's email in localStorage for the prototype.
    if (typeof window !== 'undefined') {
        localStorage.setItem('loggedInUser', email);
    }
    // Redirect to the corresponding dashboard after "login".
    router.push(`/${role}`);
  };
  
  const displayRole = roleDisplayNames[role] || capitalizeFirstLetter(role);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login as {displayRole}</CardTitle>
          <CardDescription>
            Enter your credentials to access the {displayRole.toLowerCase()} dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <Button variant="link" asChild className="mt-4 px-0">
             <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to role selection
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
