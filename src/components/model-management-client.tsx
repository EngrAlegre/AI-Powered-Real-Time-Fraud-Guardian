'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { runDataPipelineAction, trainModelAction } from '@/app/actions';
import { Loader2, Rocket, DatabaseZap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ModelManagementClient() {
  const { toast } = useToast();
  const [isTraining, startTrainingTransition] = useTransition();
  const [isPipelining, startPipelineTransition] = useTransition();
  const [trainingResult, setTrainingResult] = useState<any>(null);
  const [pipelineResult, setPipelineResult] = useState<any>(null);

  const [trainingDataPath, setTrainingDataPath] = useState("obs://fraud-guardian-data/training-data/");
  const [modelName, setModelName] = useState("fraud-detector-v2");
  const [modelDescription, setModelDescription] = useState("Fraud detection model trained on new data");

  const [transactionData, setTransactionData] = useState("{}");
  const [pipelineModelName, setPipelineModelName] = useState("fraud-detector-v2");

  const handleTrainModel = () => {
    startTrainingTransition(async () => {
      setTrainingResult(null);
      toast({ title: 'Starting Model Training...', description: 'This may take a while.' });
      const result = await trainModelAction({trainingDataPath, modelName, modelDescription});
      if (result.success) {
        toast({
          title: '✅ Training Job Started',
          description: `Job ID: ${result.data?.trainingJobId}`,
        });
        setTrainingResult(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Training Failed',
          description: result.error,
        });
        setTrainingResult({ error: result.error });
      }
    });
  };

  const handleRunPipeline = () => {
    startPipelineTransition(async () => {
      setPipelineResult(null);
      toast({ title: 'Initiating Data Pipeline...', description: 'Processing transaction data.' });
      const result = await runDataPipelineAction({
        transactionData,
        modelName: pipelineModelName
      });
      if (result.success) {
        toast({
          title: '✅ Data Pipeline Successful',
          description: result.data?.message,
        });
        setPipelineResult(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Pipeline Failed',
          description: result.error,
        });
        setPipelineResult({ error: result.error });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
           <Rocket className="h-6 w-6 text-primary" />
           <h3 className="text-lg font-semibold">Train a New Model</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Trigger a new training job on ModelArts using the latest data from OBS. This will leverage the 8-card GPU quota for optimized performance.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
                <Label htmlFor='trainingDataPath'>Training Data Path</Label>
                <Input id='trainingDataPath' value={trainingDataPath} onChange={e => setTrainingDataPath(e.target.value)} />
            </div>
            <div className='space-y-2'>
                <Label htmlFor='modelName'>Model Name</Label>
                <Input id='modelName' value={modelName} onChange={e => setModelName(e.target.value)} />
            </div>
             <div className='space-y-2 col-span-1 md:col-span-2'>
                <Label htmlFor='modelDescription'>Model Description</Label>
                <Input id='modelDescription' value={modelDescription} onChange={e => setModelDescription(e.target.value)} />
            </div>
        </div>

        <Button onClick={handleTrainModel} disabled={isTraining}>
          {isTraining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isTraining ? 'Training in Progress...' : 'Start Training Job'}
        </Button>
        {trainingResult && (
          <Alert className="mt-4">
            <AlertTitle>Training Job Result</AlertTitle>
            <AlertDescription>
              <pre className="mt-2 w-full rounded-md bg-secondary p-4 font-code text-sm">
                <code>{JSON.stringify(trainingResult, null, 2)}</code>
              </pre>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
           <DatabaseZap className="h-6 w-6 text-primary" />
           <h3 className="text-lg font-semibold">Run Data Pipeline</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Process and store new transaction data in OBS and leverage pre-trained models from AI Gallery to streamline the ML pipeline.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
                <Label htmlFor='transactionData'>Transaction Data (JSON)</Label>
                <Input id='transactionData' value={transactionData} onChange={e => setTransactionData(e.target.value)} />
            </div>
            <div className='space-y-2'>
                <Label htmlFor='pipelineModelName'>Model Name</Label>
                <Input id='pipelineModelName' value={pipelineModelName} onChange={e => setPipelineModelName(e.target.value)} />
            </div>
        </div>

        <Button onClick={handleRunPipeline} disabled={isPipelining}>
          {isPipelining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPipelining ? 'Processing...' : 'Run Data Pipeline'}
        </Button>
        {pipelineResult && (
          <Alert className="mt-4">
            <AlertTitle>Data Pipeline Result</AlertTitle>
            <AlertDescription>
              <pre className="mt-2 w-full rounded-md bg-secondary p-4 font-code text-sm">
                <code>{JSON.stringify(pipelineResult, null, 2)}</code>
              </pre>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
