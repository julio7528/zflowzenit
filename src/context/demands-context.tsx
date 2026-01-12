'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
import { useToast } from '@/hooks/use-toast';

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

interface DemandsContextType {
  items: BacklogItem[];
  addItem: (item: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => Promise<void>;
  updateItem: (item: BacklogItem) => Promise<void>;
  updateItemPdca: (itemId: string, pdcaData: Partial<PDCAAnalysis>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  settings: { k: number; b: number; avatarUrl?: string | null };
  setSettings: (settings: { k: number; b: number; avatarUrl?: string | null }) => Promise<void>;
  sortItems: (sortFn: (a: BacklogItem, b: BacklogItem) => number) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<void>;
  isLoaded: boolean;
}

const DemandsContext = createContext<DemandsContextType | undefined>(undefined);

export function DemandsProvider({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<{ k: number; b: number; avatarUrl?: string | null }>({ k: 24, b: 1, avatarUrl: null });
  const [isLoaded, setIsLoaded] = useState(false);

  const calculateScore = useCallback(
    (item: BacklogItem, currentSettings: {k: number, b: number}): number => {
      const { gravity, urgency, tendency, deadline } = item;
      if (item.category === 'reference') return 0;

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

  const convertSupabaseToLocal = (supabaseItem: SupabaseBacklogItem): BacklogItem => ({
    id: supabaseItem.id,
    activity: supabaseItem.activity,
    details: supabaseItem.details || undefined,
    category: supabaseItem.category as BacklogItemCategoryType,
    status: supabaseItem.status as KanbanStatus,
    gravity: supabaseItem.gravity,
    urgency: supabaseItem.urgency,
    tendency: supabaseItem.tendency,
    score: Number(supabaseItem.score),
    deadline: supabaseItem.deadline ? new Date(supabaseItem.deadline) : null,
    startDate: supabaseItem.start_date ? new Date(supabaseItem.start_date) : null,
    categoryId: supabaseItem.category_id,
    pdcaAnalysis: supabaseItem.pdca_analysis,
    googleCalendarEventId: supabaseItem.google_calendar_event_id,
    createdAt: new Date(supabaseItem.created_at),
    user_id: supabaseItem.user_id,
  });

  const convertLocalToSupabase = (localItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>, calculatedScore?: number): Omit<SupabaseBacklogItem, 'id' | 'created_at' | 'updated_at'> => ({
    user_id: user!.id,
    activity: localItem.activity,
    details: localItem.details || null,
    category: localItem.category,
    status: localItem.status,
    gravity: localItem.gravity,
    urgency: localItem.urgency,
    tendency: localItem.tendency,
    score: calculatedScore || 0,
    deadline: localItem.deadline ? localItem.deadline.toISOString() : null,
    start_date: localItem.startDate ? localItem.startDate.toISOString() : null,
    category_id: localItem.categoryId || null,
    pdca_analysis: localItem.pdcaAnalysis || null,
    google_calendar_event_id: localItem.googleCalendarEventId || null,
  });

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Parallel data fetching
      const [settingsResult, categoriesResult, itemsResult] = await Promise.all([
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('backlog_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      // Process Settings
      let currentSettings = { k: 24, b: 1, avatarUrl: null };
      
      if (settingsResult.error) {
        if (settingsResult.error.code !== 'PGRST116') {
          if (isAuthError(settingsResult.error)) {
            console.error('Authentication error while loading settings:', settingsResult.error);
            // await signOut(); // Prevent auto-logout on error to avoid loops
            // return;
          }
          console.error('Error loading settings:', settingsResult.error);
        } else {
            // Create default settings if not found
            const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
                user_id: user.id,
                k_factor: 24,
                b_factor: 1,
            });
            if (insertError) console.error('Error inserting default settings:', insertError);
        }
      } else if (settingsResult.data) {
        currentSettings = { 
          k: settingsResult.data.k_factor, 
          b: settingsResult.data.b_factor,
          avatarUrl: settingsResult.data.avatar_url 
        };
        setSettings(currentSettings);
      }

      // Process Categories
      if (categoriesResult.error) {
        if (isAuthError(categoriesResult.error)) {
          console.error('Authentication error while loading categories:', categoriesResult.error);
          // await signOut();
          toast({
            title: "Erro de Autenticação",
            description: "Não foi possível carregar as categorias.",
            variant: "destructive"
          });
          return;
        }
        console.error('Error loading categories:', categoriesResult.error);
      } else if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      // Process Items
      if (itemsResult.error) {
        if (isAuthError(itemsResult.error)) {
          console.error('Authentication error while loading items:', itemsResult.error);
          // await signOut();
          toast({
            title: "Erro de Autenticação",
            description: "Não foi possível carregar os itens.",
            variant: "destructive"
          });
          return;
        }
        console.error('Error loading items:', itemsResult.error);
      } else if (itemsResult.data) {
        const convertedItems = itemsResult.data.map(convertSupabaseToLocal);
        const itemsWithScores = convertedItems.map(item => ({
          ...item,
          score: calculateScore(item, currentSettings),
        }));
        setItems(itemsWithScores);
      }

    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in loadData:', error);
        // await signOut(); // Prevent auto-logout on error to avoid loops
        toast({
            title: "Erro de Autenticação",
            description: "Não foi possível carregar os dados. Tente recarregar a página.",
            variant: "destructive"
        });
        return;
      }
      console.error('Error loading data:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [user?.id, calculateScore, signOut]);

  // Adicionar item
  const addItem = useCallback(async (newItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => {
    if (!user) {
      console.error('Erro ao adicionar item: Usuário não autenticado');
      return;
    }

    try {
      const gravity = Math.max(1, Math.min(10, Number.isFinite(newItem.gravity) ? Math.round(newItem.gravity) : 1));
      const urgency = Math.max(1, Math.min(10, Number.isFinite(newItem.urgency) ? Math.round(newItem.urgency) : 1));
      const tendency = Math.max(1, Math.min(10, Number.isFinite(newItem.tendency) ? Math.round(newItem.tendency) : 1));
      
      const validatedItem = {
        ...newItem,
        gravity,
        urgency,
        tendency,
      };
      
      const calculatedScore = calculateScore(validatedItem as BacklogItem, settings);
      const supabaseItem = convertLocalToSupabase(validatedItem, calculatedScore);
      
      const { data, error } = await supabase
        .from('backlog_items')
        .insert(supabaseItem)
        .select()
        .single();

      if (error) {
        if (isAuthError(error)) {
          console.error('Authentication error while adding item:', error);
          // await signOut();
          toast({
            title: "Erro de Autenticação",
            description: "Não foi possível adicionar o item.",
            variant: "destructive"
          });
          return;
        }
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      if (data) {
        const convertedItem = convertSupabaseToLocal(data);
        const itemWithScore = {
          ...convertedItem,
          score: calculatedScore,
        };
        setItems(prev => [...prev, itemWithScore]);
      }
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in addItem:', error);
        // await signOut();
        toast({
            title: "Erro de Autenticação",
            description: "Erro ao tentar adicionar item.",
            variant: "destructive"
        });
        return;
      }
      console.error('❌ Erro ao adicionar item:', error);
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
      const validatedItem = {
        ...updatedItem,
        gravity: Math.max(1, Math.min(10, updatedItem.gravity || 1)),
        urgency: Math.max(1, Math.min(10, updatedItem.urgency || 1)),
        tendency: Math.max(1, Math.min(10, updatedItem.tendency || 1)),
      };

      const calculatedScore = calculateScore(validatedItem, settings);
      
      const supabaseUpdate = {
        activity: validatedItem.activity,
        details: validatedItem.details || null,
        category: validatedItem.category,
        status: validatedItem.status,
        gravity: validatedItem.gravity,
        urgency: validatedItem.urgency,
        tendency: validatedItem.tendency,
        score: calculatedScore,
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
          // await signOut();
          toast({
            title: "Erro de Autenticação",
            description: "Não foi possível atualizar o item.",
            variant: "destructive"
          });
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
        // await signOut();
        toast({
            title: "Erro de Autenticação",
            description: "Erro ao tentar atualizar item.",
            variant: "destructive"
        });
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
          // await signOut();
          toast({
            title: "Erro de Autenticação",
            description: "Não foi possível atualizar o PDCA.",
            variant: "destructive"
          });
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
        // await signOut();
        toast({
            title: "Erro de Autenticação",
            description: "Erro ao tentar atualizar PDCA.",
            variant: "destructive"
        });
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
      const itemToDelete = items.find(item => item.id === id);
      
      if (itemToDelete?.googleCalendarEventId) {
        const { deleteCalendarEvent } = await import('@/app/actions/delete-calendar-event');
        try {
          const sessionResult = await supabase.auth.getSession();
          if (sessionResult.data.session) {
            await deleteCalendarEvent({
              eventId: itemToDelete.googleCalendarEventId,
              userId: user.id,
              accessToken: sessionResult.data.session.access_token,
            });
          }
        } catch (calendarError) {
          console.error('❌ Erro ao chamar deleteCalendarEvent:', calendarError);
        }
      }

      const { error } = await supabase
        .from('backlog_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (isAuthError(error)) {
          console.error('Authentication error while deleting item:', error);
          // await signOut();
          toast({
            title: "Erro de Autenticação",
            description: "Não foi possível deletar o item.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in deleteItem:', error);
        // await signOut();
        toast({
            title: "Erro de Autenticação",
            description: "Erro ao tentar deletar item.",
            variant: "destructive"
        });
      } else {
        console.error('❌ Erro ao deletar item:', error);
      }
    }
  }, [user, signOut, items]);

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
          // await signOut();
          toast({
            title: "Erro de Autenticação",
            description: "Não foi possível adicionar a categoria.",
            variant: "destructive"
          });
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
        // await signOut();
        toast({
            title: "Erro de Autenticação",
            description: "Erro ao tentar adicionar categoria.",
            variant: "destructive"
        });
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
          // await signOut();
          toast({
            title: "Erro de Autenticação",
            description: "Não foi possível deletar a categoria.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      setCategories(prev => prev.filter(c => c.id !== id));
      setItems(prev => prev.map(item => 
        item.categoryId === id ? { ...item, categoryId: null } : item
      ));
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in deleteCategory:', error);
        // await signOut();
        toast({
            title: "Erro de Autenticação",
            description: "Erro ao tentar deletar categoria.",
            variant: "destructive"
        });
      } else {
        console.error('Erro ao deletar categoria:', error);
      }
    }
  }, [user, signOut]);

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings: { k: number; b: number; avatarUrl?: string | null }) => {
    if (!user) {
      console.error('Cannot update settings: User not authenticated');
      return;
    }

    try {
      const updateData: any = {
        user_id: user.id,
        k_factor: newSettings.k,
        b_factor: newSettings.b,
        updated_at: new Date().toISOString(),
      };

      if (newSettings.avatarUrl !== undefined) {
        updateData.avatar_url = newSettings.avatarUrl;
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) {
        if (isAuthError(error)) {
          console.error('Authentication error while updating settings:', error);
          await signOut();
          return;
        }
        throw error;
      }

      setSettings(prev => ({ ...prev, ...newSettings }));
      
      setItems(prev => prev.map(item => ({
        ...item,
        score: calculateScore(item, newSettings),
      })));
    } catch (error: any) {
      if (isAuthError(error)) {
        console.error('Authentication error in updateSettings:', error);
        await signOut();
      } else {
        console.error('Erro ao atualizar configurações:', JSON.stringify(error, null, 2));
        console.error('Error details:', error);
      }
    }
  }, [user, calculateScore, signOut]);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [loadData]);

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

  return (
    <DemandsContext.Provider value={{
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
    }}>
      {children}
    </DemandsContext.Provider>
  );
}

export function useDemandsContext() {
  const context = useContext(DemandsContext);
  if (context === undefined) {
    throw new Error('useDemandsContext must be used within a DemandsProvider');
  }
  return context;
}
