'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Rocket } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDCADialog } from './pdca-dialog';
import type { BacklogItem } from '@/lib/types';
import { useMemo } from 'react';

export function DocumentationList() {
  const { items, addItem, updateItem, deleteItem, isLoaded } = useSupabaseDemands();

  const documentedItems = useMemo(() => {
    return items
        .filter((item) => item.category === 'project' && item.pdcaAnalysis && Object.keys(item.pdcaAnalysis).length > 0)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items]);

  if (documentedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Nenhuma documentação encontrada
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Gere a documentação de um projeto no Kanban ou no Backlog para vê-la aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-2xl font-bold font-headline">Documentação de Projetos</h1>
          <p className="text-muted-foreground">
            Consulte e continue a documentação gerada para seus projetos PDCA/MASP.
          </p>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documentedItems.map((item: BacklogItem) => {
          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                    <FileText className="h-5 w-5 mt-1 text-primary" />
                    <span>{item.activity}</span>
                </CardTitle>
                <CardDescription>
                  Criado em: {format(item.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <PDCADialog item={item}>
                    <Button>
                        <Rocket className="mr-2" />
                        Executar Projeto
                    </Button>
                </PDCADialog>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
