'use client';

import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import type { BacklogItem, Category } from '@/lib/types';
import { useCallback } from 'react';

// Helper function to check if error is related to authentication/refresh token
const isAuthError = (error: any): boolean => {
  return (
    error?.message?.includes('Invalid Refresh Token') ||
    error?.message?.includes('Refresh Token Not Found') ||
    error?.message?.includes('JWT') ||
    error?.message?.includes('Authentication') ||
    error?.status === 401 || 
    error?.status === 403
  );
};

const ITEMS_STORAGE_KEY = 'FlowZenit-items';
const SETTINGS_STORAGE_KEY = 'FlowZenit-settings';
const CATEGORIES_STORAGE_KEY = 'FlowZenit-categories';

export function useDataMigration() {
  const { user, signOut } = useAuth();

  const migrateLocalDataToSupabase = useCallback(async () => {
    if (!user) return { success: false, message: 'Usuário não autenticado' };

    try {
      // Verificar se já existe dados no Supabase
      const { data: existingItems, error: itemsError } = await supabase
        .from('backlog_items')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (itemsError) {
        if (isAuthError(itemsError)) {
          console.error('Authentication error while checking for existing items:', itemsError);
          await signOut();
          return { success: false, message: 'Sessão expirada, faça login novamente' };
        }
        throw itemsError;
      }

      if (existingItems && existingItems.length > 0) {
        return { success: false, message: 'Dados já existem no Supabase' };
      }

      // Migrar configurações
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        const { error: settingsError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            k_factor: settings.k || 24,
            b_factor: settings.b || 1,
          });

        if (settingsError) {
          if (isAuthError(settingsError)) {
            console.error('Authentication error while migrating settings:', settingsError);
            await signOut();
            return { success: false, message: 'Sessão expirada, faça login novamente' };
          }
          throw settingsError;
        }
      }

      // Migrar categorias
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        const categories: Category[] = JSON.parse(storedCategories);
        const categoriesToInsert = categories.map(cat => ({
          user_id: user.id,
          name: cat.name,
          color: cat.color,
        }));

        const { error: categoriesError } = await supabase
          .from('categories')
          .insert(categoriesToInsert);

        if (categoriesError) {
          if (isAuthError(categoriesError)) {
            console.error('Authentication error while migrating categories:', categoriesError);
            await signOut();
            return { success: false, message: 'Sessão expirada, faça login novamente' };
          }
          throw categoriesError;
        }
      }

      // Migrar itens
      const storedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (storedItems) {
        const items: BacklogItem[] = JSON.parse(storedItems).map((item: any) => ({
          ...item,
          deadline: item.deadline ? new Date(item.deadline) : null,
          startDate: item.startDate ? new Date(item.startDate) : null,
          createdAt: new Date(item.createdAt),
        }));

        const itemsToInsert = items.map(item => ({
          user_id: user.id,
          activity: item.activity,
          details: item.details || null,
          category: item.category,
          status: item.status,
          gravity: item.gravity,
          urgency: item.urgency,
          tendency: item.tendency,
          score: item.score,
          deadline: item.deadline ? item.deadline.toISOString() : null,
          start_date: item.startDate ? item.startDate.toISOString() : null,
          category_id: item.categoryId || null,
          pdca_analysis: item.pdcaAnalysis || null,
        }));

        const { error: itemsError } = await supabase
          .from('backlog_items')
          .insert(itemsToInsert);

        if (itemsError) {
          if (isAuthError(itemsError)) {
            console.error('Authentication error while migrating items:', itemsError);
            await signOut();
            return { success: false, message: 'Sessão expirada, faça login novamente' };
          }
          throw itemsError;
        }
      }

      // Limpar localStorage após migração bem-sucedida
      localStorage.removeItem(ITEMS_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.removeItem(CATEGORIES_STORAGE_KEY);

      return { success: true, message: 'Dados migrados com sucesso!' };
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in migrateLocalDataToSupabase:', error);
        await signOut();
        return { success: false, message: 'Sessão expirada, faça login novamente' };
      }
      console.error('Erro na migração:', error);
      return { success: false, message: 'Erro ao migrar dados' };
    }
  }, [user, signOut]);

  return { migrateLocalDataToSupabase };
}