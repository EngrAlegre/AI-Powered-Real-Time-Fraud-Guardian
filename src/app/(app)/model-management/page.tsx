import ModelManagementClient from '@/components/model-management-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HuaweiPoweredBy, HuaweiServicesStack } from '@/components/huawei/huawei-badge';

export default function ModelManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
          Model Management
        </h1>
        <HuaweiPoweredBy />
      </div>
      <p className="text-muted-foreground">
        Manage your fraud detection models and data pipelines on Huawei Cloud.
      </p>

      <HuaweiServicesStack 
        services={['modelarts', 'obs', 'cloudmatrix384']} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Model Training & Deployment</CardTitle>
          <CardDescription>
            Use Huawei ModelArts with CloudMatrix384 to train new models or redeploy existing ones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModelManagementClient />
        </CardContent>
      </Card>
    </div>
  );
}
