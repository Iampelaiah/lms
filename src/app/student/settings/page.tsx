
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";

function ProfileSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your public profile and personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src="https://picsum.photos/seed/101/200/200" alt="Alex Johnson" data-ai-hint="student portrait" />
                        <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <h3 className="font-semibold">Profile Picture</h3>
                        <p className="text-sm text-muted-foreground mb-2">Update your avatar. We recommend a 200x200px image.</p>
                         <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                        </Button>
                    </div>
                </div>

                <Separator />

                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="Alex Johnson" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="alex.j@northwood.lq.zw" />
                    </div>
                     <Button>Update Profile</Button>
                     <p className="text-sm text-muted-foreground">Note: Profile changes must be approved by an administrator and may take up to 3 business days to reflect.</p>
                </form>

                <Separator />
                
                <form className="space-y-4">
                     <h3 className="text-lg font-semibold">Change Password</h3>
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                     <Button>Change Password</Button>
                </form>
            </CardContent>
        </Card>
    );
}

function NotificationSettings() {
    return (
         <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose how you want to be notified about activity on LearnetIQ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="new-grades" className="font-medium">New Grades</Label>
                        <p className="text-sm text-muted-foreground">Get notified when a tutor has graded your assignment.</p>
                    </div>
                    <Switch id="new-grades" defaultChecked />
                </div>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="forum-mentions" className="font-medium">Forum Mentions</Label>
                        <p className="text-sm text-muted-foreground">Get notified when someone mentions you in a forum post.</p>
                    </div>
                    <Switch id="forum-mentions" defaultChecked />
                </div>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="live-class-reminders" className="font-medium">Live Class Reminders</Label>
                        <p className="text-sm text-muted-foreground">Receive reminders 15 minutes before a live class starts.</p>
                    </div>
                    <Switch id="live-class-reminders" />
                </div>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="newsletter" className="font-medium">Product Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive our monthly newsletter with the latest features.</p>
                    </div>
                    <Switch id="newsletter" />
                </div>
            </CardContent>
        </Card>
    )
}

function AccountSettings() {
    return (
         <Card>
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings and data.</CardDescription>
            </CardHeader>
             <CardContent>
                 <Card className="border-destructive bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Delete Account</CardTitle>
                        <CardDescription className="text-destructive/80">Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive">Delete My Account</Button>
                    </CardContent>
                 </Card>
            </CardContent>
        </Card>
    )
}


export default function StudentSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>
            
            <Tabs defaultValue="profile">
                <TabsList className="mb-6">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <ProfileSettings />
                </TabsContent>
                <TabsContent value="notifications">
                    <NotificationSettings />
                </TabsContent>
                <TabsContent value="account">
                    <AccountSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
