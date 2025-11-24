'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { initiateGoogleAuth } from '@/app/actions/auth-google';
import { useSearchParams } from 'next/navigation';

export function SettingsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [calendarSettings, setCalendarSettings] = useState({
    clientId: '',
    secretId: '',
  });

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    if (success === 'google_connected') {
        // Clear params to avoid showing toast on refresh
        window.history.replaceState({}, '', '/settings');
        toast({
            title: "Conectado!",
            description: "Sua conta do Google Calendar foi conectada com sucesso.",
        });
    } else if (error) {
        window.history.replaceState({}, '', '/settings');
        toast({
            title: "Erro na conexão",
            description: "Não foi possível conectar ao Google Calendar. Verifique suas credenciais.",
            variant: "destructive"
        });
    }

    async function loadSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('tbf_gcp_calendar')
          .select('clientid, secretid')
          .eq('userid', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading settings:', error);
          return;
        }

        if (data) {
          setCalendarSettings({
            clientId: data.clientid || '',
            secretId: data.secretid || '',
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    loadSettings();
  }, [searchParams, toast]);

  const handleConnectGoogle = async () => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session || !session.user) {
              toast({
                  title: "Erro",
                  description: "Usuário não autenticado.",
                  variant: "destructive"
              });
              return;
          }
          await initiateGoogleAuth(session.user.id, session.access_token);
      } catch (error) {
          toast({
              title: "Erro",
              description: "Erro ao iniciar autenticação. Verifique se salvou as credenciais primeiro.",
              variant: "destructive"
          });
      }
  };

  const handleSaveGoogleCalendar = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      // Check if record exists
      const { data: existingData } = await supabase
        .from('tbf_gcp_calendar')
        .select('id')
        .eq('userid', user.id)
        .single();

      let error;

      if (existingData) {
        // Update
        const { error: updateError } = await supabase
          .from('tbf_gcp_calendar')
          .update({
            clientid: calendarSettings.clientId,
            secretid: calendarSettings.secretId,
          })
          .eq('userid', user.id);
        error = updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('tbf_gcp_calendar')
          .insert({
            userid: user.id,
            clientid: calendarSettings.clientId,
            secretid: calendarSettings.secretId,
          });
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações do Google Calendar salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold font-headline mb-6">Configurações</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências Gerais</CardTitle>
              <CardDescription>Configure suas preferências de uso da aplicação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select defaultValue="pt-br">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select defaultValue="america/sao_paulo">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america/sao_paulo">América/São Paulo</SelectItem>
                    <SelectItem value="america/new_york">América/Nova York</SelectItem>
                    <SelectItem value="europe/london">Europa/Londres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Google Calendar</CardTitle>
              <CardDescription>
                Configure as credenciais para integração com o Google Calendar.
                <br />
                <span className="text-xs text-muted-foreground">
                    Redirect URI necessário no Google Cloud Console: <strong>{process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google</strong>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input 
                  id="clientId" 
                  placeholder="Insira o Client ID" 
                  value={calendarSettings.clientId}
                  onChange={(e) => setCalendarSettings(prev => ({ ...prev, clientId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input 
                  id="clientSecret" 
                  type="password" 
                  placeholder="Insira o Client Secret" 
                  value={calendarSettings.secretId}
                  onChange={(e) => setCalendarSettings(prev => ({ ...prev, secretId: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={handleSaveGoogleCalendar} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Credenciais'}
                </Button>
                <Button variant="outline" onClick={handleConnectGoogle}>
                    Conectar / Autorizar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-50 pointer-events-none select-none">
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como você deseja receber notificações.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Receba atualizações importantes por email</p>
                </div>
                <Switch defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência da aplicação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select defaultValue="system">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Salvar Configurações Gerais</Button>
          </div>
        </div>
      </div>
    </div>
  );
}