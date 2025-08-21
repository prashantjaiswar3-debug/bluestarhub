
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FilePlus2 } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Invoices</CardTitle>
          <CardDescription>
            This section is under construction. Here you will be able to view, manage, and track all generated invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
            <FilePlus2 className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Invoice management functionality coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

    