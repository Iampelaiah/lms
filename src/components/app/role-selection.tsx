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
  href: string;
  hasPreview?: boolean;
};

const roles: Role[] = [
  {
    name: 'Student',
    description: 'Access your courses, track progress, and get AI help.',
    icon: GraduationCap,
    href: '/login/student',
  },
  {
    name: 'Tutor',
    description: 'Manage your courses, schedule classes, and grade assignments.',
    icon: Briefcase,
    href: '/login/tutor',
  },
  {
    name: 'Parent',
    description: "View your child's progress, reports, and communicate with tutors.",
    icon: Shield,
    href: '/login/parent',
  },
  {
    name: 'School Admin',
    description: 'Oversee school operations, manage users, and view analytics.',
    icon: UserCog,
    href: '/login/admin',
    hasPreview: true,
  },
];

export function RoleSelection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      {roles.map((role) => (
        <Card
          key={role.name}
          className={cn(
            'h-full hover:border-primary transition-colors duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col',
            role.name === 'School Admin' && 'bg-amber-400/20 border-amber-400/50 hover:border-amber-500'
          )}
        >
          <Link href={role.href} className="block group flex-grow">
            <CardHeader className="flex-row items-center gap-4 pb-4">
              <div
                className={cn(
                  'bg-primary/10 p-3 rounded-lg',
                  role.name === 'School Admin' && 'bg-amber-500/20'
                )}
              >
                <role.icon
                  className={cn(
                    'w-6 h-6 text-primary',
                    role.name === 'School Admin' && 'text-amber-600'
                  )}
                />
              </div>
              <CardTitle
                className={cn(
                  'text-xl',
                  role.name === 'School Admin' && 'text-amber-900 dark:text-amber-100'
                )}
              >
                {role.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className={role.name === 'School Admin' ? 'text-amber-800/80 dark:text-amber-200/80' : ''}>
                {role.description}
              </CardDescription>
            </CardContent>
          </Link>
          {role.hasPreview && (
            <div className="px-6 pb-4 mt-auto">
              <Link href="/admin" className="group/preview flex items-center justify-end gap-2 text-sm font-medium text-amber-900/70 dark:text-amber-200/70 hover:text-amber-900 dark:hover:text-amber-100 transition-colors">
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
              </Link>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
