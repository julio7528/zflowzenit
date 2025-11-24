'use client';

import { useDemandsContext } from '@/context/demands-context';

export function useSupabaseDemands() {
  return useDemandsContext();
}