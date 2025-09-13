import supabase from '../utils/supabase';
import type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '../types/ingredients';
import { paginate, type Pagination } from '../utils/pagination';

const ingredientService = {
  async getIngredients(page: number = 1, limit: number = 10) {
    try {
      const { data, error, count } = await supabase
        .from('ingredients')
        .select('*', { count: 'exact' })
        .order('name')
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      const paginatedResult = paginate(data || [], page, limit);
      paginatedResult.total = count || 0;

      return {
        success: true,
        data: paginatedResult
      };
    } catch (error) {
      console.error('Error in getIngredients:', error);
      throw error;
    }
  },

  async getIngredientById(id: number) {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in getIngredientById:', error);
      throw error;
    }
  },

  async createIngredient(ingredientData: CreateIngredientRequest) {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .insert([ingredientData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in createIngredient:', error);
      throw error;
    }
  },

  async updateIngredient(id: number, updateData: UpdateIngredientRequest) {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in updateIngredient:', error);
      throw error;
    }
  },

  async deleteIngredient(id: number) {
    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in deleteIngredient:', error);
      throw error;
    }
  }
};

export default ingredientService;
