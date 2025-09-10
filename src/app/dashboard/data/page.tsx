
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { initialInventory, initialPurchaseOrders, initialQuotations } from "@/lib/data";
import { initialVendors } from "@/lib/vendordata";
import { Download, Upload } from "lucide-react";

export default function DataManagementPage() {
    const { toast } = useToast();

    const handleBackup = () => {
        try {
            const allData = {
                quotations: initialQuotations,
                inventory: initialInventory,
                purchaseOrders: initialPurchaseOrders,
                vendors: initialVendors,
                // In a real app, you would fetch this from your database
            };

            const dataStr = JSON.stringify(allData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `bluestar-hub-backup-${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: "Backup Successful",
                description: "Your data has been downloaded as a JSON file.",
            });
        } catch (error) {
            console.error("Backup failed:", error);
            toast({
                variant: "destructive",
                title: "Backup Failed",
                description: "Could not create the backup file.",
            });
        }
    };

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                        Backup your application data. You can upload the backup file to a secure location like Google Cloud Storage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Download className="h-5 w-5" />
                                    Backup Data
                                </CardTitle>
                                <CardDescription>
                                    Download a complete backup of all your current application data as a single JSON file.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={handleBackup}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Backup File
                                </Button>
                            </CardContent>
                        </Card>
                         <Card className="flex-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Upload className="h-5 w-5" />
                                    Upload to Cloud
                                </CardTitle>
                                <CardDescription>
                                    After downloading, you can manually upload the JSON file to your Google Cloud Storage bucket for safekeeping.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" asChild>
                                    <a href="https://console.cloud.google.com/storage" target="_blank" rel="noopener noreferrer">
                                        Go to Google Cloud Storage
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
