'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { 
  BacklogItem, 
  Category, 
  PDCAAnalysis, 
  SupabaseBacklogItem, 
  UserSettings,
  BacklogItemCategoryType,
  KanbanStatus
} from '@/lib/types';
import { differenceInHours } from 'date-fns';

const defaultCategories: Category[] = [
    { id: '1', name: 'Trabalho', color: '#3b82f6' },
    { id: '2', name: 'Pessoal', color: '#10b981' },
    { id: '3', name: 'Estudo', color: '#f97316' },
];

export function useSupabaseDemands() {
  const { user } = useAuth();
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState({ k: 24, b: 1 });
  const [isLoaded, setIsLoaded] = useState(false);

  const calculateScore = useCallback(
    (item: BacklogItem, currentSettings: {k: number, b: number}): number => {
      const { gravity, urgency, tendency, deadline } = item;
      if (item.category === 'reference' || (gravity === 0 && urgency === 0 && tendency === 0)) return 0;

      const gutProduct = gravity * urgency * tendency;

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
  const convertLocalToSupabase = (localItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>): Omit<SupabaseBacklogItem, 'id' | 'created_at' | 'updated_at'> => ({
    user_id: user!.id,
    activity: localItem.activity,
    details: localItem.details || null,
    category: localItem.category,
    status: localItem.status,
    gravity: localItem.gravity,
    urgency: localItem.urgency,
    tendency: localItem.tendency,
    score: 0, // Será calculado
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
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsData) {
        setSettings({ k: settingsData.k_factor, b: settingsData.b_factor });
      } else {
        // Criar configurações padrão
        await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            k_factor: 24,
            b_factor: 1,
          });
      }

      // Carregar categorias
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        // Criar categorias padrão
        const categoriesToInsert = defaultCategories.map(cat => ({
          user_id: user.id,
          name: cat.name,
          color: cat.color,
        }));

        const { data: newCategories } = await supabase
          .from('categories')
          .insert(categoriesToInsert)
          .select();

        if (newCategories) {
          setCategories(newCategories);
        }
      }

      // Carregar itens
      const { data: itemsData } = await supabase
        .from('backlog_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsData) {
        const convertedItems = itemsData.map(convertSupabaseToLocal);
        const itemsWithScores = convertedItems.map(item => ({
          ...item,
          score: calculateScore(item, settingsData ? { k: settingsData.k_factor, b: settingsData.b_factor } : { k: 24, b: 1 }),
        }));
        setItems(itemsWithScores);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [user, calculateScore]);

  // Adicionar item
  const addItem = useCallback(async (newItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => {
    if (!user) {
      console.error('Erro ao adicionar item: Usuário não autenticado');
      return;
    }

    try {
      console.log('🔄 Adicionando item:', newItem);
      
      const supabaseItem = convertLocalToSupabase(newItem);
      console.log('📤 Dados para Supabase:', supabaseItem);
      
      const { data, error } = await supabase
        .from('backlog_items')
        .insert(supabaseItem)
        .select()
        .single();

      if (error) {
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
          score: calculateScore(convertedItem, settings),
        };
        setItems(prev => [...prev, itemWithScore]);
      }
    } catch (error) {
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
  }, [user, calculateScore, settings]);

  // Atualizar item
  const updateItem = useCallback(async (updatedItem: BacklogItem) => {
    if (!user) return;

    try {
      const supabaseUpdate = {
        activity: updatedItem.activity,
        details: updatedItem.details || null,
        category: updatedItem.category,
        status: updatedItem.status,
        gravity: updatedItem.gravity,
        urgency: updatedItem.urgency,
        tendency: updatedItem.tendency,
        deadline: updatedItem.deadline ? updatedItem.deadline.toISOString() : null,
        start_date: updatedItem.startDate ? updatedItem.startDate.toISOString() : null,
        category_id: updatedItem.categoryId || null,
        pdca_analysis: updatedItem.pdcaAnalysis || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('backlog_items')
        .update(supabaseUpdate)
        .eq('id', updatedItem.id)
        .eq('user_id', user.id);

      if (error) throw error;

      const itemWithScore = {
        ...updatedItem,
        score: calculateScore(updatedItem, settings),
      };

      setItems(prev => prev.map(item => 
        item.id === updatedItem.id ? itemWithScore : item
      ));
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  }, [user, calculateScore, settings]);

  // Atualizar PDCA
  const updateItemPdca = useCallback(async (itemId: string, pdcaData: Partial<PDCAAnalysis>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('backlog_items')
        .update({
          pdca_analysis: pdcaData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

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
    } catch (error) {
      console.error('Erro ao atualizar PDCA:', error);
    }
  }, [user]);

  // Deletar item
  const deleteItem = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('backlog_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erro ao deletar item:', error);
    }
  }, [user]);

  // Adicionar categoria
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    if (!user) return null;

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

      if (error) throw error;

      if (data) {
        setCategories(prev => [...prev, data]);
        return data;
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
    return null;
  }, [user]);

  // Deletar categoria
  const deleteCategory = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== id));
      // Remover categoria dos itens
      setItems(prev => prev.map(item => 
        item.categoryId === id ? { ...item, categoryId: null } : item
      ));
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  }, [user]);

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings: { k: number; b: number }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          k_factor: newSettings.k,
          b_factor: newSettings.b,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSettings(newSettings);
      
      // Recalcular scores
      setItems(prev => prev.map(item => ({
        ...item,
        score: calculateScore(item, newSettings),
      })));
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
    }
  }, [user, calculateScore]);

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

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