'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User, Mail, Phone, MapPin, Edit, Save, X, Lock, Eye, EyeOff, Shield, KeyRound, Upload, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseDemands } from '@/hooks/use-supabase-demands';

export function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  const { settings, setSettings } = useSupabaseDemands();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings?.avatarUrl) {
      setAvatarUrl(settings.avatarUrl);
    } else if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [settings, user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setAvatarUrl(data.publicUrl);
      toast({
        title: 'Upload concluído',
        description: 'Imagem carregada com sucesso. Clique em Salvar para confirmar.',
      });
      
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message || 'Erro ao fazer upload da imagem.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    repeat: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    current: '',
    new: '',
    repeat: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        location: user.user_metadata?.location || '',
        bio: user.user_metadata?.bio || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    console.log('Saving profile:', formData);
    
    try {
        if (avatarUrl !== settings.avatarUrl) {
            await setSettings({ ...settings, avatarUrl });
        }
        
        setIsEditing(false);
        toast({
            title: 'Perfil atualizado',
            description: 'Suas informações foram salvas com sucesso.',
        });
    } catch (error) {
        toast({
            title: 'Erro ao salvar',
            description: 'Não foi possível salvar as alterações.',
            variant: 'destructive',
        });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        location: user.user_metadata?.location || '',
        bio: user.user_metadata?.bio || '',
      });
    }
    setIsEditing(false);
  };

  const validatePasswordForm = (): boolean => {
    const errors = {
      current: '',
      new: '',
      repeat: '',
    };
    let isValid = true;

    // Validate current password
    if (!passwordData.currentPassword) {
      errors.current = 'Senha atual é obrigatória';
      isValid = false;
    }

    // Validate new password
    if (!passwordData.newPassword) {
      errors.new = 'Nova senha é obrigatória';
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.new = 'A senha deve ter no mínimo 6 caracteres';
      isValid = false;
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.new = 'A nova senha deve ser diferente da atual';
      isValid = false;
    }

    // Validate repeat password
    if (!passwordData.repeatPassword) {
      errors.repeat = 'Por favor, repita a nova senha';
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.repeatPassword) {
      errors.repeat = 'As senhas não coincidem';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handlePasswordFormSubmit = () => {
    if (validatePasswordForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handlePasswordChange = async () => {
    setIsChangingPassword(true);
    setShowConfirmDialog(false);

    try {
      // First, verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword,
      });

      if (signInError) {
        toast({
          title: 'Erro',
          description: 'Senha atual incorreta',
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) {
        toast({
          title: 'Erro ao alterar senha',
          description: updateError.message,
          variant: 'destructive',
        });
        setIsChangingPassword(false);
        return;
      }

      // Success!
      toast({
        title: 'Senha alterada com sucesso!',
        description: 'Um e de confirmação foi enviado para você.',
      });

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        repeatPassword: '',
      });
      setPasswordErrors({
        current: '',
        new: '',
        repeat: '',
      });
      setShowPasswordForm(false);
    } catch (error: any) {
      toast({
        title: 'Erro inesperado',
        description: error.message || 'Não foi possível alterar a senha',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      repeatPassword: '',
    });
    setPasswordErrors({
      current: '',
      new: '',
      repeat: '',
    });
    setShowPasswordForm(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Perfil</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-lg">
                        {formData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                        <>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Label htmlFor="avatar-upload" className="cursor-pointer text-white p-2">
                                    <Upload className="h-6 w-6" />
                                </Label>
                                <Input 
                                    id="avatar-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleAvatarUpload}
                                    disabled={isUploading}
                                />
                            </div>
                        </>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-semibold">{formData.name}</h3>
                    <Badge variant="secondary">Usuário Ativo</Badge>
                    <p className="text-sm text-muted-foreground">
                      Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                    {isEditing && (
                        <div className="flex items-center gap-2 mt-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Ou cole uma URL de imagem..." 
                                value={avatarUrl || ''} 
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="h-8 text-sm max-w-md"
                            />
                        </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={!isEditing}
                        placeholder="São Paulo, SP"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Conte um pouco sobre você..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configurações de preferências em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Configurações de Segurança</CardTitle>
                    <CardDescription>Gerencie a segurança da sua conta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showPasswordForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <KeyRound className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">Senha</h4>
                          <p className="text-sm text-muted-foreground">
                            Última alteração: {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : 'Nunca'}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => setShowPasswordForm(true)}>
                        <Lock className="h-4 w-4 mr-2" />
                        Renovar Senha
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border rounded-lg p-6 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Alterar Senha</h3>
                      <Button variant="ghost" size="sm" onClick={cancelPasswordChange}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, currentPassword: e.target.value });
                              setPasswordErrors({ ...passwordErrors, current: '' });
                            }}
                            placeholder="Digite sua senha atual"
                            className={passwordErrors.current ? 'border-red-500' : ''}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {passwordErrors.current && (
                          <p className="text-sm text-red-500">{passwordErrors.current}</p>
                        )}
                      </div>

                      {/* New Password */}
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, newPassword: e.target.value });
                              setPasswordErrors({ ...passwordErrors, new: '' });
                            }}
                            placeholder="Digite a nova senha"
                            className={passwordErrors.new ? 'border-red-500' : ''}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {passwordErrors.new && (
                          <p className="text-sm text-red-500">{passwordErrors.new}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Mínimo de 6 caracteres
                        </p>
                      </div>

                      {/* Repeat New Password */}
                      <div className="space-y-2">
                        <Label htmlFor="repeat-password">Repetir Nova Senha</Label>
                        <div className="relative">
                          <Input
                            id="repeat-password"
                            type={showPasswords.repeat ? 'text' : 'password'}
                            value={passwordData.repeatPassword}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, repeatPassword: e.target.value });
                              setPasswordErrors({ ...passwordErrors, repeat: '' });
                            }}
                            placeholder="Repita a nova senha"
                            className={passwordErrors.repeat ? 'border-red-500' : ''}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPasswords({ ...showPasswords, repeat: !showPasswords.repeat })}
                          >
                            {showPasswords.repeat ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {passwordErrors.repeat && (
                          <p className="text-sm text-red-500">{passwordErrors.repeat}</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handlePasswordFormSubmit}
                          disabled={isChangingPassword}
                          className="flex-1"
                        >
                          {isChangingPassword ? 'Alterando...' : 'Confirmar'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelPasswordChange}
                          disabled={isChangingPassword}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alteração de Senha</AlertDialogTitle>
            <AlertDialogDescription>
              Você realmente deseja alterar sua senha? Esta ação não pode ser desfeita e você receberá um email de confirmação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordChange}>
              Sim, Alterar Senha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}