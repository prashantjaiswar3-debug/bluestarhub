import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, Eye } from "lucide-react";
import type { Quotation } from "@/lib/types";

const quotations: Quotation[] = [
    { quoteId: "QT-2023-051", customer: "ABC Corporation", amount: 75000.00, status: "Sent", date: "2023-10-25" },
    { quoteId: "QT-2023-050", customer: "Green Valley Apartments", amount: 120000.00, status: "Approved", date: "2023-10-22" },
    { quoteId: "QT-2023-049", customer: "Downtown Cafe", amount: 25000.00, status: "Draft", date: "2023-10-21" },
    { quoteId: "QT-2023-048", customer: "City Retail Store", amount: 45000.00, status: "Rejected", date: "2023-10-20" },
];

const statusVariant: { [key in Quotation["status"]]: "default" | "secondary" | "outline" | "destructive" } = {
  Sent: "default",
  Approved: "secondary",
  Draft: "outline",
  Rejected: "destructive",
};

export default function SalesDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Create Quotation</CardTitle>
          <CardDescription>Fill in the details to generate a new quote.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input id="customer-name" placeholder="e.g., ABC Corporation" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="services">Services / Parts</Label>
            <Textarea id="services" placeholder="e.g., 4x Dome Cameras, 1x 8-Channel DVR..." />
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="labor-cost">Labor Cost (₹)</Label>
                <Input id="labor-cost" type="number" placeholder="5000" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="total-cost">Total Amount (₹)</Label>
                <Input id="total-cost" type="number" placeholder="25000" />
            </div>
           </div>
          <Button className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Generate & Send Quote
          </Button>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Quotations</CardTitle>
          <CardDescription>Track the status of recently sent quotes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quote) => (
                <TableRow key={quote.quoteId}>
                  <TableCell className="font-medium">{quote.quoteId}</TableCell>
                  <TableCell>{quote.customer}</TableCell>
                  <TableCell>₹{quote.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[quote.status]}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
