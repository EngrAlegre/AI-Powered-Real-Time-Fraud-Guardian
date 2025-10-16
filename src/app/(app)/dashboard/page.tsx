import RiskMetrics from "@/components/dashboard/risk-metrics";
import { HuaweiPoweredBy, HuaweiServicesStack } from "@/components/huawei/huawei-badge";
import { ServiceStatusCard } from "@/components/huawei/service-status-card";
import { DatabaseStatusIndicator, DatabaseStatusCard } from "@/components/database-status-indicator";
import LiveTransactionFeed from "@/components/dashboard/live-transaction-feed";
import RealTimeAlerts from "@/components/dashboard/real-time-alerts";
import ExplainableAICard from "@/components/dashboard/explainable-ai-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
            Dashboard
          </h1>
          <div className="mt-2">
            <DatabaseStatusIndicator />
          </div>
        </div>
        <HuaweiPoweredBy />
      </div>

      <HuaweiServicesStack 
        services={['pangu-models', 'modelarts', 'gaussdb', 'functiongraph']} 
      />

      {/* Risk Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RiskMetrics />
        </div>
        <DatabaseStatusCard />
      </div>

      {/* Live Transaction Feed & Real-time Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LiveTransactionFeed transactions={[]} />
        <RealTimeAlerts alerts={[]} />
      </div>

      {/* AI Decision Explanation */}
      <ExplainableAICard />

      {/* Service Status */}
      <ServiceStatusCard 
        services={[
          { service: 'pangu-models', status: 'connected', message: 'AI reasoning active' },
          { service: 'modelarts', status: 'connected', message: 'ML platform ready' },
          { service: 'gaussdb', status: 'connected', message: 'Primary database active' },
          { service: 'functiongraph', status: 'disconnected', message: 'Using Next.js API' },
        ]}
      />
    </div>
  );
}
