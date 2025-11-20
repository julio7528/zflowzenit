'use client';

import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import type {
  BacklogItem,
  BacklogItemCategoryType,
  Category,
  KanbanStatus,
  PDCAAnalysis,
  SupabaseBacklogItem
} from '@/lib/types';
import { differenceInHours } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

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

export function useSupabaseDemands() {
  const { user, signOut } = useAuth();
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState({ k: 24, b: 1 });
  const [isLoaded, setIsLoaded] = useState(false);

  const calculateScore = useCallback(
    (item: BacklogItem, currentSettings: {k: number, b: number}): number => {
      const { gravity, urgency, tendency, deadline } = item;
      if (item.category === 'reference') return 0;

      // Garantir que os valores estejam no range válido (1-10)
      const validGravity = Math.max(1, Math.min(10, gravity || 1));
      const validUrgency = Math.max(1, Math.min(10, urgency || 1));
      const validTendency = Math.max(1, Math.min(10, tendency || 1));

      const gutProduct = validGravity * validUrgency * validTendency;

      if (!deadline) {
        return gutProduct * 0.01;
      }

      const now = new Date();
      const hoursRemaining = differenceInHours(deadline, now);

      if (hoursRemaining <= 0) {
        return gutProduct * currentSettings.k;
      }

      return gutProduct * (currentSettings.k / (hoursRemaining + currentSettings.b));
    },
    []
  );

  // Converter dados do Supabase para formato local
  // Ajustar a conversão de dados - linha ~45
  const convertSupabaseToLocal = (supabaseItem: SupabaseBacklogItem): BacklogItem => ({
    id: supabaseItem.id,
    activity: supabaseItem.activity,
    details: supabaseItem.details || undefined,
    category: supabaseItem.category as BacklogItemCategoryType, // Tipagem mais específica
    status: supabaseItem.status as KanbanStatus, // Tipagem mais específica
    gravity: supabaseItem.gravity,
    urgency: supabaseItem.urgency,
    tendency: supabaseItem.tendency,
    score: Number(supabaseItem.score), // Converter numeric para number
    deadline: supabaseItem.deadline ? new Date(supabaseItem.deadline) : null,
    startDate: supabaseItem.start_date ? new Date(supabaseItem.start_date) : null,
    categoryId: supabaseItem.category_id,
    pdcaAnalysis: supabaseItem.pdca_analysis,
    createdAt: new Date(supabaseItem.created_at),
    user_id: supabaseItem.user_id,
  });

  // Converter dados locais para formato Supabase
  const convertLocalToSupabase = (localItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>, calculatedScore?: number): Omit<SupabaseBacklogItem, 'id' | 'created_at' | 'updated_at'> => ({
    user_id: user!.id,
    activity: localItem.activity,
    details: localItem.details || null,
    category: localItem.category,
    status: localItem.status,
    gravity: localItem.gravity,
    urgency: localItem.urgency,
    tendency: localItem.tendency,
    score: calculatedScore || 0, // Usar o score calculado se fornecido
    deadline: localItem.deadline ? localItem.deadline.toISOString() : null,
    start_date: localItem.startDate ? localItem.startDate.toISOString() : null,
    category_id: localItem.categoryId || null,
    pdca_analysis: localItem.pdcaAnalysis || null,
  });

  // Carregar dados do Supabase
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Carregar configurações
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Handle authentication error specifically
      if (settingsError) {
        // Ignore "Row not found" error (PGRST116) as we will create default settings
        if (settingsError.code !== 'PGRST116') {
          if (isAuthError(settingsError)) {
            console.error('Authentication error while loading settings:', settingsError);
            await signOut();
            return;
          }
          // For non-auth errors, just log them but continue
          console.error('Error loading settings:', settingsError);
        }
      }

      if (settingsData) {
        setSettings({ k: settingsData.k_factor, b: settingsData.b_factor });
      } else {
        // Criar configurações padrão
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            k_factor: 24,
            b_factor: 1,
          });
        
        if (insertError) {
          // If insert fails, it might be RLS. Log it clearly.
          console.error('Error inserting default settings:', insertError);
        }
      }

      // Carregar categorias (sem criar categorias padrão)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (categoriesError) {
        if (isAuthError(categoriesError)) {
          console.error('Authentication error while loading categories:', categoriesError);
          await signOut();
          return;
        }
        console.error('Error loading categories:', categoriesError);
      } else if (categoriesData) {
        setCategories(categoriesData);
      }

      // Carregar itens
      const { data: itemsData, error: itemsError } = await supabase
        .from('backlog_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsError) {
        if (isAuthError(itemsError)) {
          console.error('Authentication error while loading items:', itemsError);
          await signOut();
          return;
        }
        console.error('Error loading items:', itemsError);
      } else if (itemsData) {
        const convertedItems = itemsData.map(convertSupabaseToLocal);
        const itemsWithScores = convertedItems.map(item => ({
          ...item,
          score: calculateScore(item, settingsData ? { k: settingsData.k_factor, b: settingsData.b_factor } : { k: 24, b: 1 }),
        }));
        setItems(itemsWithScores);
      }

    } catch (error: any) {
      // Handle unexpected errors
      if (isAuthError(error)) {
        console.error('Authentication error in loadData:', error);
        await signOut();
      } else {
        console.error('Unexpected error loading data:', error);
      }
    } finally {
      setIsLoaded(true);
    }
  }, [user, calculateScore, signOut]);

  // Adicionar item
  const addItem = useCallback(async (newItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => {
    if (!user) {
      console.error('Erro ao adicionar item: Usuário não autenticado');
      return;
    }

    try {
      console.log('🔄 Adicionando item:', newItem);
      console.log('🔍 Valores GUT recebidos:', { 
        gravity: newItem.gravity, 
        urgency: newItem.urgency, 
        tendency: newItem.tendency,
        types: {
          gravity: typeof newItem.gravity,
          urgency: typeof newItem.urgency,
          tendency: typeof newItem.tendency
        }
      });
      
      // Garantir que os valores estejam no range válido (1-10) antes de salvar
      // Converter explicitamente para inteiros para evitar problemas de tipo
      const gravity = Math.max(1, Math.min(10, Number.isFinite(newItem.gravity) ? Math.round(newItem.gravity) : 1));
      const urgency = Math.max(1, Math.min(10, Number.isFinite(newItem.urgency) ? Math.round(newItem.urgency) : 1));
      const tendency = Math.max(1, Math.min(10, Number.isFinite(newItem.tendency) ? Math.round(newItem.tendency) : 1));
      
      const validatedItem = {
        ...newItem,
        gravity,
        urgency,
        tendency,
      };
      
      console.log('🧪 Validação GUT aplicada:', { 
        gravity: validatedItem.gravity, 
        urgency: validatedItem.urgency, 
        tendency: validatedItem.tendency,
        types: {
          gravity: typeof validatedItem.gravity,
          urgency: typeof validatedItem.urgency,
          tendency: typeof validatedItem.tendency
        }
      });
      
      // Calcular o score antes de salvar
      const calculatedScore = calculateScore(validatedItem as BacklogItem, settings);
      const supabaseItem = convertLocalToSupabase(validatedItem, calculatedScore);
      
      console.log('📤 Dados finais para Supabase:', {
        ...supabaseItem,
        gravity_type: typeof supabaseItem.gravity,
        urgency_type: typeof supabaseItem.urgency,
        tendency_type: typeof supabaseItem.tendency,
        gravity_value: supabaseItem.gravity,
        urgency_value: supabaseItem.urgency,
        tendency_value: supabaseItem.tendency
      });
      
      const { data, error } = await supabase
        .from('backlog_items')
        .insert(supabaseItem)
        .select()
        .single();

      if (error) {
        // Check if it's an authentication error
        if (isAuthError(error)) {
          console.error('Authentication error while adding item:', error);
          await signOut();
          return;
        }
        // Log detalhado do erro do Supabase
        console.error('❌ Erro do Supabase:');
        console.error('- Message:', error.message);
        console.error('- Details:', error.details);
        console.error('- Hint:', error.hint);
        console.error('- Code:', error.code);
        console.error('- Erro completo:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (data) {
        console.log('✅ Item adicionado com sucesso:', data);
        
        const convertedItem = convertSupabaseToLocal(data);
        const itemWithScore = {
          ...convertedItem,
          score: calculatedScore, // Usar o score já calculado
        };
        setItems(prev => [...prev, itemWithScore]);
      }
    } catch (error: any) {
      // Check if it's an authentication error from a non-Supabase source
      if (isAuthError(error)) {
        console.error('Authentication error in addItem:', error);
        await signOut();
        return;
      }
      
      // Log detalhado do erro geral
      console.error('❌ Erro ao adicionar item:');
      console.error('- Type:', typeof error);
      console.error('- Constructor:', error?.constructor?.name);
      
      if (error instanceof Error) {
        console.error('- Message:', error.message);
        console.error('- Stack:', error.stack);
      }
      
      // Tentar serializar o erro completo
      try {
        console.error('- Erro serializado:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      } catch (serializationError) {
        console.error('- Erro na serialização:', serializationError);
        console.error('- Erro original (toString):', error?.toString());
      }
      
      // Re-throw para que o componente possa tratar o erro
      throw error;
    }
  }, [user, calculateScore, settings, signOut]);

  // Atualizar item
  const updateItem = useCallback(async (updatedItem: BacklogItem) => {
    if (!user) {
      console.error('Cannot update item: User not authenticated');
      return;
    }

    try {
      // Garantir que os valores estejam no range válido (1-10) antes de salvar
      const validatedItem = {
        ...updatedItem,
        gravity: Math.max(1, Math.min(10, updatedItem.gravity || 1)),
        urgency: Math.max(1, Math.min(10, updatedItem.urgency || 1)),
        tendency: Math.max(1, Math.min(10, updatedItem.tendency || 1)),
      };

      // Calcular o score antes de salvar
      const calculatedScore = calculateScore(validatedItem, settings);
      
      const supabaseUpdate = {
        activity: validatedItem.activity,
        details: validatedItem.details || null,
        category: validatedItem.category,
        status: validatedItem.status,
        gravity: validatedItem.gravity,
        urgency: validatedItem.urgency,
        tendency: validatedItem.tendency,
        score: calculatedScore, // Salvar o score calculado no banco
        deadline: validatedItem.deadline ? validatedItem.deadline.toISOString() : null,
        start_date: validatedItem.startDate ? validatedItem.startDate.toISOString() : null,
        category_id: validatedItem.categoryId || null,
        pdca_analysis: validatedItem.pdcaAnalysis || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('backlog_items')
        .update(supabaseUpdate)
        .eq('id', validatedItem.id)
        .eq('user_id', user.id);

      if (error) {
        if (isAuthError(error)) {
          console.error('Authentication error while updating item:', error);
          await signOut();
          return;
        }
        throw error;
      }

      const itemWithScore = {
        ...validatedItem,
        score: calculatedScore,
      };

      setItems(prev => prev.map(item => 
        item.id === validatedItem.id ? itemWithScore : item
      ));
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in updateItem:', error);
        await signOut();
      } else {
        console.error('Error updating item:', error);
      }
    }
  }, [user, calculateScore, settings, signOut]);

  // Atualizar PDCA
  const updateItemPdca = useCallback(async (itemId: string, pdcaData: Partial<PDCAAnalysis>) => {
    if (!user) {
      console.error('Cannot update PDCA: User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('backlog_items')
        .update({
          pdca_analysis: pdcaData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        if (isAuthError(error)) {
          console.error('Authentication error while updating PDCA:', error);
          await signOut();
          return;
        }
        throw error;
      }

      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            pdcaAnalysis: {
              ...(item.pdcaAnalysis || {}),
              ...pdcaData,
            }
          };
        }
        return item;
      }));
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in updateItemPdca:', error);
        await signOut();
      } else {
        console.error('Erro ao atualizar PDCA:', error);
      }
    }
  }, [user, signOut]);

  // Deletar item
  const deleteItem = useCallback(async (id: string) => {
    if (!user) {
      console.error('Cannot delete item: User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('backlog_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (isAuthError(error)) {
          console.error('Authentication error while deleting item:', error);
          await signOut();
          return;
        }
        throw error;
      }

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in deleteItem:', error);
        await signOut();
      } else {
        console.error('Erro ao deletar item:', error);
      }
    }
  }, [user, signOut]);

  // Adicionar categoria
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    if (!user) {
      console.error('Cannot add category: User not authenticated');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: category.name,
          color: category.color,
        })
        .select()
        .single();

      if (error) {
        if (isAuthError(error)) {
          console.error('Authentication error while adding category:', error);
          await signOut();
          return null;
        }
        throw error;
      }

      if (data) {
        setCategories(prev => [...prev, data]);
        return data;
      }
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in addCategory:', error);
        await signOut();
        return null;
      }
      console.error('Erro ao adicionar categoria:', error);
    }
    return null;
  }, [user, signOut]);

  // Deletar categoria
  const deleteCategory = useCallback(async (id: string) => {
    if (!user) {
      console.error('Cannot delete category: User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (isAuthError(error)) {
          console.error('Authentication error while deleting category:', error);
          await signOut();
          return;
        }
        throw error;
      }

      setCategories(prev => prev.filter(c => c.id !== id));
      // Remover categoria dos itens
      setItems(prev => prev.map(item => 
        item.categoryId === id ? { ...item, categoryId: null } : item
      ));
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in deleteCategory:', error);
        await signOut();
      } else {
        console.error('Erro ao deletar categoria:', error);
      }
    }
  }, [user, signOut]);

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings: { k: number; b: number }) => {
    if (!user) {
      console.error('Cannot update settings: User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          k_factor: newSettings.k,
          b_factor: newSettings.b,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        if (isAuthError(error)) {
          console.error('Authentication error while updating settings:', error);
          await signOut();
          return;
        }
        throw error;
      }

      setSettings(newSettings);
      
      // Recalcular scores
      setItems(prev => prev.map(item => ({
        ...item,
        score: calculateScore(item, newSettings),
      })));
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in updateSettings:', error);
        await signOut();
      } else {
        console.error('Erro ao atualizar configurações:', error);
      }
    }
  }, [user, calculateScore, signOut]);

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData, signOut]);

  // Recalcular scores periodicamente
  useEffect(() => {
    if (isLoaded && user) {
      const interval = setInterval(() => {
        setItems(prev => prev.map(item => ({
          ...item,
          score: calculateScore(item, settings),
        })));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isLoaded, user, settings, calculateScore]);

  const sortItems = useCallback((sortFn: (a: BacklogItem, b: BacklogItem) => number) => {
    setItems(currentItems => [...currentItems].sort(sortFn));
  }, []);

  return {
    items,
    addItem,
    updateItem,
    updateItemPdca,
    deleteItem,
    settings,
    setSettings: updateSettings,
    sortItems,
    categories,
    addCategory,
    deleteCategory,
    isLoaded,
  };
}