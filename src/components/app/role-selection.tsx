'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Briefcase, GraduationCap, Shield, UserCog, Eye } from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

type Role = {
  name: UserRole;
  description: string;
  icon: React.ElementType;
  loginHref: string;
  previewHref: string;
};

const roles: Role[] = [
  {
    name: 'Student',
    description: 'Access your courses, track progress, and get AI help.',
    icon: GraduationCap,
    loginHref: '/login/student',
    previewHref: '/student',
  },
  {
    name: 'Tutor',
    description: 'Manage your courses, schedule classes, and grade assignments.',
    icon: Briefcase,
    loginHref: '/login/tutor',
    previewHref: '/tutor',
  },
  {
    name: 'Parent',
    description: "View your child's progress, reports, and communicate with tutors.",
    icon: Shield,
    loginHref: '/login/parent',
    previewHref: '/parent',
  },
  {
    name: 'School Admin',
    description: 'Oversee school operations, manage users, and view analytics.',
    icon: UserCog,
    loginHref: '/login/admin',
    previewHref: '/admin',
  },
];

export function RoleSelection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      {roles.map((role) => (
        <Card
          key={role.name}
          className="h-full hover:border-primary transition-colors duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
        >
          <Link href={role.loginHref} className="block group flex-grow">
            <CardHeader className="flex-row items-center gap-4 pb-4">
              <div
                className="bg-primary/10 p-3 rounded-lg"
              >
                <role.icon
                  className="w-6 h-6 text-primary"
                />
              </div>
              <CardTitle
                className="text-xl"
              >
                {role.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {role.description}
              </CardDescription>
            </CardContent>
          </Link>
          <div className="px-6 pb-4 mt-auto flex justify-end">
              <Link href={role.previewHref} className="group/preview flex items-center justify-center gap-2 text-sm font-medium text-accent hover:text-accent-foreground transition-colors border border-accent/50 rounded-md px-3 py-1 hover:bg-accent">
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
              </Link>
            </div>
        </Card>
      ))}
    </div>
  );
}
