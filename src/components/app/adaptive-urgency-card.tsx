'use client';

import { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { getAdjustedUrgency } from '@/app/actions';
import type { AdjustUrgencyOutput } from '@/ai/flows/adaptive-urgency-adjustment';
import { Skeleton } from '../ui/skeleton';

export function AdaptiveUrgencyCard() {
  const [completionRate, setCompletionRate] = useState(0.8);
  const [completionTime, setCompletionTime] = useState(10);
  const [currentUrgency, setCurrentUrgency] = useState(7);
  const [result, setResult] = useState<AdjustUrgencyOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdjust = async () => {
    setIsLoading(true);
    setResult(null);
    const res = await getAdjustedUrgency({
      taskCompletionRate: completionRate,
      averageTaskCompletionTime: completionTime,
      urgency: currentUrgency,
    });
    setResult(res);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <CardTitle>IA de Urgência Adaptativa</CardTitle>
        </div>
        <CardDescription>
          Deixe a IA ajustar o fator de urgência com base no seu desempenho.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Taxa de Conclusão de Tarefas: {Math.round(completionRate * 100)}%</Label>
          <Slider
            value={[completionRate]}
            onValueChange={(v) => setCompletionRate(v[0])}
            max={1}
            step={0.01}
          />
        </div>
        <div className="space-y-2">
          <Label>Tempo Médio de Conclusão (horas): {completionTime}h</Label>
          <Slider
            value={[completionTime]}
            onValueChange={(v) => setCompletionTime(v[0])}
            max={40}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label>Fator de Urgência Atual</Label>
          <Input
            type="number"
            value={currentUrgency}
            onChange={(e) => setCurrentUrgency(Number(e.target.value))}
            min={1}
            max={10}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <Button onClick={handleAdjust} disabled={isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Ajustando...' : 'Ajustar Urgência'}
        </Button>
        {isLoading && (
            <div className='w-full space-y-2'>
                <Skeleton className='h-8 w-1/3' />
                <Skeleton className='h-12 w-full' />
            </div>
        )}
        {result && (
          <div className="rounded-md border bg-muted/50 p-4 w-full text-sm">
            <p className="font-semibold">
              Urgência Ajustada:{' '}
              <span className="text-primary font-bold text-lg">
                {result.adjustedUrgency.toFixed(2)}
              </span>
            </p>
            <p className="text-muted-foreground mt-2">{result.reasoning}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
