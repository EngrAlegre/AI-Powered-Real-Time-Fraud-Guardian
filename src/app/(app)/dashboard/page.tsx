import RiskMetrics from "@/components/dashboard/risk-metrics";
import { HuaweiPoweredBy, HuaweiServicesStack } from "@/components/huawei/huawei-badge";
import { ServiceStatusCard } from "@/components/huawei/service-status-card";
import LiveDemoDashboard from "@/components/dashboard/live-demo-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
          Dashboard
        </h1>
        <HuaweiPoweredBy />
      </div>

      <HuaweiServicesStack 
        services={['pangu-models', 'modelarts', 'gaussdb', 'functiongraph']} 
      />

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="live">🔴 Live Demo (Real-Time)</TabsTrigger>
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="space-y-6 mt-6">
          <LiveDemoDashboard />
        </TabsContent>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <RiskMetrics />
          
          <ServiceStatusCard 
            services={[
              { service: 'pangu-models', status: 'connected', message: 'AI reasoning active' },
              { service: 'modelarts', status: 'connected', message: 'ML platform ready' },
              { service: 'gaussdb', status: 'disconnected', message: 'Using Firestore' },
              { service: 'functiongraph', status: 'disconnected', message: 'Using Next.js API' },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
