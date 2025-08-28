
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlusCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialExpenses: Expense[] = [
    { id: 'EXP-001', technicianId: 'TECH-007', technicianName: 'Technician User', date: '2023-10-28', category: 'Travel', amount: 350, description: 'Travel to client site in South Zone', status: 'Pending' },
    { id: 'EXP-002', technicianId: 'TECH-007', technicianName: 'Technician User', date: '2023-10-27', category: 'Food', amount: 200, description: 'Lunch during full-day installation', status: 'Approved' },
    { id: 'EXP-003', technicianId: 'TECH-007', technicianName: 'Technician User', date: '2023-10-29', category: 'Materials', amount: 1200, description: 'Purchase of extra cables for urgent repair', status: 'Pending' },
    { id: 'EXP-004', technicianId: 'TECH-007', technicianName: 'Technician User', date: '2023-10-29', category: 'Other', amount: 150, description: 'Stationery and printouts for site report', status: 'Rejected' },
];

const expenseStatusVariant: { [key in Expense["status"]]: "default" | "secondary" | "destructive" } = {
  Pending: "default",
  Approved: "secondary",
  Rejected: "destructive",
};

const expenseCategories: Expense['category'][] = ['Travel', 'Food', 'Materials', 'Tools', 'Other'];

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = React.useState<Expense[]>(initialExpenses);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = React.useState(false);
  const [newExpense, setNewExpense] = React.useState<Omit<Expense, 'id' | 'technicianId' | 'technicianName' | 'status' | 'amount'> & { amount: string }>({
    date: new Date().toISOString().split('T')[0],
    category: 'Travel',
    amount: '',
    description: '',
  });

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all required fields to submit an expense.",
      });
      return;
    }

    const expenseData: Expense = {
      id: `EXP-${Date.now()}`,
      technicianId: 'TECH-007', // Hardcoded for demo
      technicianName: 'Technician User', // Hardcoded for demo
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      status: 'Pending',
    };

    setExpenses(prev => [expenseData, ...prev]);
    toast({
      title: "Expense Submitted",
      description: `Your expense claim for ${formatCurrency(expenseData.amount)} has been submitted for approval.`,
    });
    setIsAddExpenseOpen(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Travel',
      amount: '',
      description: '',
    });
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>My Expenses</CardTitle>
            <CardDescription>
              Track your expense claims and their approval status.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddExpenseOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Expense
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                    <TableCell className="hidden sm:table-cell max-w-xs truncate">{expense.description}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={expenseStatusVariant[expense.status]}>{expense.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Fill in the details of your expense claim below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="expense-date">Date</Label>
                    <Input id="expense-date" type="date" value={newExpense.date} onChange={e => setNewExpense(prev => ({...prev, date: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="expense-category">Category</Label>
                    <Select value={newExpense.category} onValueChange={(value: Expense['category']) => setNewExpense(prev => ({...prev, category: value}))}>
                        <SelectTrigger id="expense-category">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (INR)</Label>
                <Input id="expense-amount" type="number" placeholder="e.g., 500" value={newExpense.amount} onChange={e => setNewExpense(prev => ({...prev, amount: e.target.value}))}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="expense-description">Description</Label>
                <Textarea id="expense-description" placeholder="e.g., Travel from office to client site for Job ID: JOB-001" value={newExpense.description} onChange={e => setNewExpense(prev => ({...prev, description: e.target.value}))}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="expense-receipt">Upload Receipt (Optional)</Label>
                <Input id="expense-receipt" type="file" className="text-muted-foreground" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddExpense}>Submit for Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    