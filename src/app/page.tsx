
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = 'admin' | 'technician' | 'freelance' | 'customer' | 'sales' | 'supervisor';


export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('admin');

  const handleSignIn = () => {
    let path = '/dashboard';
    switch (role) {
      case 'admin':
        path = '/dashboard';
        break;
      case 'technician':
        path = '/dashboard/technician';
        break;
      case 'freelance':
        path = '/dashboard/technician/freelance';
        break;
      case 'customer':
        path = '/dashboard/customer';
        break;
      case 'sales':
      case 'supervisor':
        path = '/dashboard/sales';
        break;
    }
    router.push(path);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md lg:max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex items-center justify-center">
              <Image src="https://raw.githubusercontent.com/prashantjaiswar3-debug/Bluestar/refs/heads/main/bluestarlogo1.png" alt="Bluestar Logo" width={200} height={80} />
            </div>
            <CardTitle className="text-2xl">Bluestar Hub</CardTitle>
            <CardDescription>
              Sign in to manage your operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="role">Select Your Role</Label>
                 <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role to sign in as" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="freelance">Freelance Tech</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" onClick={handleSignIn}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
