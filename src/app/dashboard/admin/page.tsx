
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Wrench, Users, FileText, ArrowRight, FilePlus2 } from 'lucide-react';

const quickLinks = [
    { href: "/dashboard/sales", icon: LayoutGrid, title: "Assignments", description: "Assign jobs to technicians." },
    { href: "/dashboard/technician", icon: Wrench, title: "Technician View", description: "Manage your assigned jobs." },
    { href: "/dashboard/customer", icon: Users, title: "Customer Portal", description: "Track complaints and invoices." },
    { href: "/dashboard/quotations", icon: FileText, title: "Sales & Quotes", description: "Create and manage quotations." },
    { href: "/dashboard/invoices", icon: FilePlus2, title: "Invoices", description: "Manage and track invoices." },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Bluestar Hub</h1>
        <p className="text-muted-foreground mt-1">Select a dashboard to manage your operations.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
            <Card key={link.href} className="flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div className="p-3 rounded-md bg-primary/10 text-primary">
                        <link.icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{link.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-muted-foreground">{link.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button asChild className="w-full">
                        <Link href={link.href}>Go to {link.title} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}
