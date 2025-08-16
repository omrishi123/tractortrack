"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/app-context';
import { customerContactPrediction } from '@/ai/flows/customer-contact-prediction';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface AIPredictionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type PredictionResult = {
  customersToContact: string[];
  reasoning: string;
};

export default function AIPredictionModal({ isOpen, onOpenChange }: AIPredictionModalProps) {
  const { customers, workLogs, settings } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const handlePrediction = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Prepare data for the AI flow
      const customerData = JSON.stringify(customers.map(c => {
        const lastWorkLog = workLogs
          .filter(w => w.customerId === c.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        return {
          name: c.name,
          phone: c.phone,
          lastServiceDate: lastWorkLog?.date || 'N/A',
        };
      }));

      const jobDetails = JSON.stringify({
        routineServiceIntervalsInDays: settings.serviceIntervals,
      });

      const prediction = await customerContactPrediction({ customerData, jobDetails });
      setResult(prediction);

    } catch (error) {
      console.error("AI Prediction Error:", error);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "Could not get a prediction. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if(!open) setResult(null);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="text-accent" />
            AI Customer Contact Prediction
          </DialogTitle>
          <DialogDescription>
            Let AI analyze your data to suggest which customers might be due for routine service.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {!result && (
            <div className='text-center'>
                <p className="text-sm text-muted-foreground mb-4">
                This tool uses your customers' work history and your service interval settings to identify who to contact next.
                </p>
                <Button onClick={handlePrediction} disabled={isLoading}>
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                    'Run Prediction'
                )}
                </Button>
            </div>
          )}

          {result && (
            <Alert>
              <AlertTitle>Prediction Results</AlertTitle>
              <AlertDescription className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Customers to Contact:</h4>
                  {result.customersToContact.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {result.customersToContact.map((name) => <li key={name}>{name}</li>)}
                    </ul>
                  ) : (
                    <p>No customers immediately due for service based on the data.</p>
                  )}
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Reasoning:</h4>
                    <p className="text-xs">{result.reasoning}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setResult(null)} className="mt-4">Run Again</Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
