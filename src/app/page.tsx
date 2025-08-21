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
import { Gem } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex items-center justify-center">
              <Gem className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Bluestar Hub
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
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
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground mb-4">
                Or continue as a demo user:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/admin">Admin</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/technician">Technician</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/customer">Customer</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/sales">Sales</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
