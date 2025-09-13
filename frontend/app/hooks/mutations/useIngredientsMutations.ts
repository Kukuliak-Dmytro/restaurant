import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import type { 
  CreateIngredientRequest, 
  UpdateIngredientRequest 
} from '../../types/ingredients';

export const useCreateIngredient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateIngredientRequest) => {
      const response = await apiClient.createIngredient(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create ingredient');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateIngredientRequest }) => {
      const response = await apiClient.updateIngredient(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update ingredient');
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', id] });
    },
  });
};

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.deleteIngredient(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete ingredient');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};
