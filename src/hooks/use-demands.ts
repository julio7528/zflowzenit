'use client';

import type { BacklogItem, Category, PDCAAnalysis } from '@/lib/types';
import { useState, useCallback, useEffect } from 'react';
import { differenceInHours } from 'date-fns';

const initialItems: BacklogItem[] = [];

const ITEMS_STORAGE_KEY = 'flowzen-items';
const SETTINGS_STORAGE_KEY = 'flowzen-settings';
const CATEGORIES_STORAGE_KEY = 'flowzen-categories';

const defaultCategories: Category[] = [
    { id: '1', name: 'Trabalho', color: '#3b82f6' },
    { id: '2', name: 'Pessoal', color: '#10b981' },
    { id: '3', name: 'Estudo', color: '#f97316' },
];

export function useBacklog() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [settings, setSettings] = useState({ k: 24, b: 1 });
  const [categories, setCategories] = useState<Category[]>([]);
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

  const updateScoresAndSort = useCallback((currentItems: BacklogItem[], currentSettings: {k: number, b: number}) => {
      const updated = currentItems.map((d) => ({
        ...d,
        score: calculateScore(d, currentSettings),
      }));
      return [...updated];
  }, [calculateScore]);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);

      let loadedSettings = { k: 24, b: 1 };
      if (storedSettings) {
        loadedSettings = JSON.parse(storedSettings);
      }
      setSettings(loadedSettings);

      let loadedCategories = defaultCategories;
      if (storedCategories) {
        loadedCategories = JSON.parse(storedCategories);
      }
      setCategories(loadedCategories);

      let loadedItems = initialItems;
      if (storedItems) {
        loadedItems = JSON.parse(storedItems).map((item: any) => ({
          ...item,
          deadline: item.deadline ? new Date(item.deadline) : null,
          startDate: item.startDate ? new Date(item.startDate) : null,
          createdAt: new Date(item.createdAt),
        }));
      }
      
      setItems(updateScoresAndSort(loadedItems, loadedSettings));

    } catch (error) {
        console.error("Failed to load from localStorage", error);
        setItems(updateScoresAndSort(initialItems, { k: 24, b: 1 }));
        setCategories(defaultCategories);
    }
    setIsLoaded(true);
  }, [updateScoresAndSort]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
       setItems(currentItems => updateScoresAndSort(currentItems, settings));
    }
  }, [settings, isLoaded, updateScoresAndSort]);

   useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories, isLoaded]);


  useEffect(() => {
    if(isLoaded) {
        const interval = setInterval(() => {
          setItems(currentItems => updateScoresAndSort(currentItems, settings));
        }, 5000); // Recalcula a cada 5 segundos
    
        return () => clearInterval(interval);
    }
  }, [isLoaded, settings, updateScoresAndSort]);

  const addItem = useCallback((newItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => {
    const itemToAdd: BacklogItem = {
        ...newItem,
        id: new Date().toISOString() + Math.random(),
        score: 0,
        createdAt: new Date(),
    };
    setItems((prev) => updateScoresAndSort([...prev, itemToAdd], settings));
  }, [settings, updateScoresAndSort]);

  const updateItem = useCallback((updatedItem: BacklogItem) => {
    setItems((prev) => {
        const newItems = prev.map((d) => (d.id === updatedItem.id ? updatedItem : d))
        return updateScoresAndSort(newItems, settings);
    });
  }, [settings, updateScoresAndSort]);
  
  const updateItemPdca = useCallback((itemId: string, pdcaData: Partial<PDCAAnalysis>) => {
    setItems(prev => {
        const newItems = prev.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    pdcaAnalysis: {
                        ...(item.pdcaAnalysis || {}),
                        ...pdcaData,
                    }
                }
            }
            return item;
        });
        return newItems;
    });
  }, []);


  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((d) => d.id !== id));
  }, []);
  
  const sortItems = useCallback((sortFn: (a: BacklogItem, b: BacklogItem) => number) => {
    setItems(currentItems => [...currentItems].sort(sortFn));
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: new Date().toISOString() };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // Remove category from items
    setItems(prev => prev.map(item => item.categoryId === id ? { ...item, categoryId: null } : item));
  }, []);

  return {
    items,
    addItem,
    updateItem,
    updateItemPdca,
    deleteItem,
    settings,
    setSettings,
    sortItems,
    categories,
    addCategory,
    deleteCategory,
    isLoaded,
  };
}
