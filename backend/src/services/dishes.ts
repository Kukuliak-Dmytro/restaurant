import supabase from '../utils/supabase';
import type { Dish, CreateDishRequest, UpdateDishRequest, Category } from '../types/dishes';
import { paginate, type Pagination } from '../utils/pagination';

const dishService = {
  async getDishes(page: number = 1, limit: number = 10) {
    try {
      const { data, error, count } = await supabase
        .from('dishes')
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
      console.error('Error in getDishes:', error);
      throw error;
    }
  },

  async getDishById(id: number) {
    try {
      const { data, error } = await supabase
        .from('dishes')
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
      console.error('Error in getDishById:', error);
      throw error;
    }
  },

  async createDish(dishData: CreateDishRequest) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .insert([dishData])
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
      console.error('Error in createDish:', error);
      throw error;
    }
  },

  async updateDish(id: number, updateData: UpdateDishRequest) {
    try {
      const { data, error } = await supabase
        .from('dishes')
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
      console.error('Error in updateDish:', error);
      throw error;
    }
  },

  async deleteDish(id: number) {
    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in deleteDish:', error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }
};

export default dishService;
