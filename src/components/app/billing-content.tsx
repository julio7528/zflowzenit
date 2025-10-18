'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export function BillingPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold font-headline mb-6">Cobrança</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plano Atual
              </CardTitle>
              <CardDescription>Gerencie sua assinatura e métodos de pagamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Plano Gratuito</h3>
                  <p className="text-sm text-muted-foreground">Até 10 projetos</p>
                </div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <Button>Fazer Upgrade</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>Visualize suas faturas anteriores.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Nenhuma fatura encontrada.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}