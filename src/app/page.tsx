
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
import { Gem, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const demoUsers = [
  { role: "Admin", href: "/dashboard/admin", description: "Full access to all dashboards." },
  { role: "Technician", href: "/dashboard/technician", description: "View and manage assigned jobs." },
  { role: "Customer", href: "/dashboard/customer", description: "Track complaints and pay invoices." },
  { role: "Sales", href: "/dashboard/sales", description: "Create and manage sales quotations." },
];

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md lg:max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex items-center justify-center">
              <Gem className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Bluestar Hub
            </CardTitle>
            <CardDescription>
              by Bluestar Electronics
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
              <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard/admin">Sign In</Link>
              </Button>
            </div>
            
            <Separator className="my-6" />

            <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                    Or use a demo account to explore:
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {demoUsers.map((user) => (
                        <Button key={user.role} variant="outline" asChild>
                            <Link href={user.href}>
                                {user.role}
                                <ArrowRight className="ml-auto h-4 w-4" />
                            </Link>
                        </Button>
                    ))}
                </div>
                 <Card className="mt-4 bg-muted/50 border-dashed">
                    <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
                        <p><strong>Admin (Vaibhav Rodge):</strong> Email: `vaibhav.rodge@bluestar.com`, Pass: `admin123`</p>
                        <p><strong>Technician (Default):</strong> Email: `tech@bluestar.com`, Pass: `tech123`</p>
                        <p><strong>Customer (Default):</strong> Email: `customer@bluestar.com`, Pass: `customer123`</p>
                        <p><strong>Sales (Vaibhav Rodge):</strong> Email: `vaibhav.rodge@bluestar.com`, Pass: `sales123`</p>
                    </CardContent>
                </Card>
            </div>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}
