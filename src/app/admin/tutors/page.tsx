

import { Button } from "@/components/ui/button";
import { Copy, GraduationCap } from "lucide-react";
import { SchoolHeader } from "@/components/app/school-header";
import { Input } from "@/components/ui/input";


export default function TutorsPage() {
    const inviteLink = "http://localhost:3000/invite/tutor-a1b2-c3d4-e5f6";
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tutor Management</h1>
                <p className="text-muted-foreground">View, search, and manage all tutors in your school.</p>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
              <div className="flex flex-col items-center gap-4 text-center">
                <GraduationCap className="h-16 w-16 text-muted-foreground" />
                <h3 className="text-2xl font-bold tracking-tight">
                  No Tutors Invited
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Use the invitation link below to invite tutors to your school. Once they accept, they will appear in your tutor list.
                </p>
                <div className="flex items-center gap-2 pt-2">
                    <Input readOnly value={inviteLink} className="h-9 text-xs min-w-[280px]" />
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy link</span>
                    </Button>
                </div>
              </div>
            </div>
        </div>
    );
}
