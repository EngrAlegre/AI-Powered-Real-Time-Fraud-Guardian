"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldAlert, Activity, BarChart } from "lucide-react";
import { useEffect, useState } from "react";

type Metric = {
    icon: React.ReactNode;
    title: string;
    value: string;
    change: string;
};

const initialMetrics: Metric[] = [
  {
    icon: <Wallet className="h-6 w-6 text-primary" />,
    title: "Total Transactions",
    value: "0",
    change: "",
  },
  {
    icon: <ShieldAlert className="h-6 w-6 text-destructive" />,
    title: "Fraudulent Activities",
    value: "0",
    change: "",
  },
  {
    icon: <Activity className="h-6 w-6 text-accent" />,
    title: "Average Risk Score",
    value: "0",
    change: "",
  },
  {
    icon: <BarChart className="h-6 w-6 text-green-500" />,
    title: "Model Accuracy",
    value: "0%",
    change: "",
  },
];

export default function RiskMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);

  useEffect(() => {
    // In a real application, you would fetch this data from an API.
    setMetrics(initialMetrics);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
