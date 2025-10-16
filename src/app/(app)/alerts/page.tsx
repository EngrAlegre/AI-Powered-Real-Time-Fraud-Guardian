"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileSearch,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Alert = {
  id: string;
  transactionId: string;
  timestamp: string;
  severity: "High" | "Medium" | "Low";
  description: string;
  isRead: boolean;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // In a real application, you would fetch this data via a WebSocket or API.
    setAlerts([]);
  }, []);

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "High":
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case "Medium":
        return <AlertTriangle className="h-5 w-5 text-accent" />;
      case "Low":
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => alert.id === id ? {...alert, isRead: true} : alert));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
        Fraud Alerts
      </h1>
      <p className="text-muted-foreground">
        Real-time notifications of potentially fraudulent activities.
      </p>

      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={cn(!alert.isRead && 'bg-primary/5 border-primary/20')}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                <div className="flex items-center gap-4">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <CardTitle className="text-base">
                      {alert.description}
                    </CardTitle>
                    <CardDescription>
                      Transaction ID: {alert.transactionId} &bull;{" "}
                      {new Date(alert.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={
                    alert.severity === "High"
                      ? "destructive"
                      : alert.severity === "Medium"
                      ? "default"
                      : "secondary"
                  }
                  className={cn(alert.severity === 'Medium' && 'bg-accent text-accent-foreground')}
                >
                  {alert.severity} Risk
                </Badge>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">
                  <FileSearch className="mr-2 h-4 w-4" /> View Transaction
                </Button>
                {!alert.isRead && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(alert.id)}>
                        Mark as Read
                    </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center h-96">
          <CardHeader>
            <div className="mx-auto bg-green-100 dark:bg-green-900/50 p-4 rounded-full">
              <ShieldCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="mt-4">No Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              There are no new fraud alerts at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
