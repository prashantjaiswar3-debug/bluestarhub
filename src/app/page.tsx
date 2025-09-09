
import Link from "next/link";
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

export default function LoginPage() {
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@bluestar.com"
                  required
                  defaultValue="admin@bluestar.com"
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
                <Input id="password" type="password" required defaultValue="password" />
              </div>
              <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard/admin">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
