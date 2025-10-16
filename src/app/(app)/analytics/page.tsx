"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export default function AnalyticsPage() {
  // Data would be fetched from an API
  const riskScoreData: any[] = [];
  const fraudTrendData: any[] = [];
  const modelPerformanceData: any[] = [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
        Analytics Dashboard
      </h1>
      <p className="text-muted-foreground">
        Deep dive into fraud trends and model performance.
      </p>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Risk Overview</TabsTrigger>
          <TabsTrigger value="trends">Fraud Trends</TabsTrigger>
          <TabsTrigger value="performance">Model Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Risk Score Distribution</CardTitle>
              <CardDescription>Distribution of risk scores across all transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-72 w-full">
                 {riskScoreData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskScoreData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis />
                      <Tooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="transactions" fill="var(--color-primary)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                 ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No risk score data to display.
                    </div>
                 )}
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Fraudulent Transactions Over Time</CardTitle>
              <CardDescription>Number of fraudulent transactions detected per day.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-72 w-full">
                {fraudTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fraudTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="fraudulent" stroke="var(--color-destructive)" />
                      <Line type="monotone" dataKey="approved" stroke="var(--color-primary)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No trend data to display.
                    </div>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Metrics</CardTitle>
              <CardDescription>Accuracy, precision, and recall over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-72 w-full">
                {modelPerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={modelPerformanceData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line dataKey="accuracy" type="natural" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                      <Line dataKey="precision" type="natural" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                      <Line dataKey="recall" type="natural" stroke="var(--color-destructive)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No model performance data to display.
                    </div>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
