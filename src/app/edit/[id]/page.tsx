'use client';

import { AppLayout } from '@/components/app/app-layout';
import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EditBacklogItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { items, updateItem, isLoaded } = useSupabaseDemands();

  const item = useMemo(() => items.find(i => i.id === id), [items, id]);

  const [activity, setActivity] = useState('');
  const [details, setDetails] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [gravity, setGravity] = useState(1);
  const [urgency, setUrgency] = useState(1);
  const [tendency, setTendency] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setActivity(item.activity || '');
      setDetails(item.details || '');
      setDeadline(item.deadline ? new Date(item.deadline) : null);
      setGravity(item.gravity || 1);
      setUrgency(item.urgency || 1);
      setTendency(item.tendency || 1);
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await updateItem({
        ...item,
        activity: activity.trim(),
        details: details.trim() || undefined,
        deadline: deadline,
        gravity,
        urgency,
        tendency,
      });
      router.push('/calendar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {!isLoaded ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-slate-600 text-lg font-medium">Carregando item...</p>
          </div>
        ) : !item ? (
          <div className="text-center py-16">
            <p className="text-lg text-slate-500 mb-2">Item não encontrado</p>
            <Button variant="outline" onClick={() => router.push('/calendar')}>Voltar ao calendário</Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Editar Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="activity">Atividade</Label>
                <Input id="activity" value={activity} onChange={(e) => setActivity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Descrição</Label>
                <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {deadline ? (
                        format(deadline, "dd 'de' MMMM, yyyy", { locale: ptBR })
                      ) : (
                        <span className="text-muted-foreground">Definir prazo</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline ?? undefined}
                      onSelect={(date) => setDeadline(date ?? null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-4">
                <Label>Ajustar GUT</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Gravidade</span>
                      <span className="text-sm font-medium">{gravity}</span>
                    </div>
                    <Slider value={[gravity]} onValueChange={(v) => setGravity(v[0])} min={1} max={10} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Urgência</span>
                      <span className="text-sm font-medium">{urgency}</span>
                    </div>
                    <Slider value={[urgency]} onValueChange={(v) => setUrgency(v[0])} min={1} max={10} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tendência</span>
                      <span className="text-sm font-medium">{tendency}</span>
                    </div>
                    <Slider value={[tendency]} onValueChange={(v) => setTendency(v[0])} min={1} max={10} step={1} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving || !activity.trim()}>
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}