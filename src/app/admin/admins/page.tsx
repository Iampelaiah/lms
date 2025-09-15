
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const admins = [
    {
        name: "Pelaiah Ngarande",
        email: "pngarande@northwood.lq.zw",
        role: "Super Admin",
        status: "Active",
    },
    {
        name: "John Smith",
        email: "jsmith@northwood.lq.zw",
        role: "Admin",
        status: "Active",
    },
    {
        name: "Michael Johnson",
        email: "mjohnson@northwood.lq.zw",
        role: "Admin",
        status: "Active",
    },
    ...Array.from({ length: 7 }, (_, i) => ({
        name: "Unassigned Seat",
        email: "---",
        role: "Admin",
        status: "Invite Pending",
    })),
];

const roleVariantMap: Record<string, "default" | "secondary"> = {
    "Super Admin": "default",
    "Admin": "secondary",
}

const statusVariantMap: Record<string, "default" | "secondary" | "outline"> = {
    "Active": "default",
    "Invite Pending": "outline",
}

function AdminList() {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>All Administrators</CardTitle>
                        <CardDescription>A list of all administrators for your institution.</CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search admins..." className="pl-9" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Administrator</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.map((admin, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="font-medium">{admin.name}</div>
                                    <div className="text-sm text-muted-foreground">{admin.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={roleVariantMap[admin.role]}>{admin.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={statusVariantMap[admin.status]}>{admin.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    {admin.status === "Active" && <Button variant="outline">Edit</Button>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function AdminsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <AdminList />
        </div>
    );
}
