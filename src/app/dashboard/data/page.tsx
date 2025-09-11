
"use client";

import { useState } from "react";
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
import { Download, Upload, Cloud, Wifi, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import QRCode from "react-qr-code";

export default function DataManagementPage() {
    const { toast } = useToast();
    const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
    const [isAutoSync, setIsAutoSync] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const handleBackup = () => {
        try {
            const allData = {
                quotations: initialQuotations,
                inventory: initialInventory,
                purchaseOrders: initialPurchaseOrders,
                vendors: initialVendors,
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
    
    const handleConnect = () => {
        setIsConnected(true);
        setIsSyncDialogOpen(false);
        toast({
            title: "Cloud Drive Connected",
            description: "Your cloud storage has been successfully linked.",
        });
    }

    return (
        <>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>
                            Backup your application data or set up cloud synchronization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Download className="h-5 w-5" />
                                        Manual Backup
                                    </CardTitle>
                                    <CardDescription>
                                        Download all application data as a single JSON file.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <Button onClick={handleBackup}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Backup
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Upload className="h-5 w-5" />
                                        Upload to Cloud
                                    </CardTitle>
                                    <CardDescription>
                                        Manually upload your backup file to Google Cloud Storage for safekeeping.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <Button variant="outline" asChild>
                                        <a href="https://console.cloud.google.com/storage" target="_blank" rel="noopener noreferrer">
                                            Go to Cloud Storage
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                             <Card className="flex flex-col bg-accent/25 border-green-500/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Cloud className="h-5 w-5 text-green-600" />
                                        Cloud Sync
                                    </CardTitle>
                                    <CardDescription>
                                        Connect a cloud drive for automatic daily backups.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                     {isConnected ? (
                                        <div className="flex flex-col items-start gap-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                                                <Wifi className="h-4 w-4" />
                                                <span>Active & Synchronizing</span>
                                            </div>
                                            <Button variant="destructive" size="sm" onClick={() => setIsConnected(false)}>
                                                <X className="mr-2 h-4 w-4" />
                                                Disconnect
                                            </Button>
                                        </div>
                                    ) : (
                                       <Button variant="secondary" onClick={() => setIsSyncDialogOpen(true)}>
                                           Connect Drive
                                       </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Connect Cloud Storage</DialogTitle>
                        <DialogDescription>
                            Scan the QR code with your phone to authorize access to your Google Drive account for backups.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 flex flex-col items-center gap-6">
                        <div className="bg-white p-4 rounded-lg border">
                           <QRCode value="https://cloud.google.com/storage" size={160} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="auto-sync" checked={isAutoSync} onCheckedChange={setIsAutoSync} />
                            <Label htmlFor="auto-sync">Enable Auto-Sync</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                         <Button onClick={handleConnect}>Connect</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
