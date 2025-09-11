'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Briefcase, GraduationCap, Shield, UserCog } from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/lib/types';

type Role = {
  name: UserRole;
  description: string;
  icon: React.ElementType;
  href: string;
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
  },
];

export function RoleSelection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
      {roles.map((role) => (
        <Link href={role.href} key={role.name} className="block group">
          <Card className="h-full hover:border-primary transition-colors duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <role.icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{role.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{role.description}</CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
