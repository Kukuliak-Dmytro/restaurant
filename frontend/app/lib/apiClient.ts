import type { ShiftRequest, ShiftResponse } from '../types/schedule';
import type { 
  Ingredient, 
  CreateIngredientRequest, 
  UpdateIngredientRequest, 
  IngredientResponse, 
  IngredientsListResponse 
} from '../types/ingredients';
import type {
  Dish,
  CreateDishRequest,
  UpdateDishRequest,
  DishResponse,
  DishesListResponse,
  Category,
  CategoriesListResponse
} from '../types/dishes';
import { supabase } from './supabase';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Get current session token from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`Making request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  }

  // Shift API methods
  async createShift(shiftData: ShiftRequest): Promise<ShiftResponse> {
    return this.request<ShiftResponse>('/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData),
    });
  }

  async getShifts(startDate: string, endDate: string): Promise<ShiftResponse> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return this.request<ShiftResponse>(`/shifts?${params}`);
  }

  async getShift(shiftDate: string): Promise<ShiftResponse> {
    return this.request<ShiftResponse>(`/shifts/${shiftDate}`);
  }

  async updateShift(shiftDate: string, updateData: Partial<ShiftRequest>): Promise<ShiftResponse> {
    return this.request<ShiftResponse>(`/shifts/${shiftDate}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteShift(shiftDate: string): Promise<ShiftResponse> {
    return this.request<ShiftResponse>(`/shifts/${shiftDate}`, {
      method: 'DELETE',
    });
  }

  // Ingredients API methods
  async getIngredients(page: number = 1, limit: number = 10): Promise<IngredientsListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request<IngredientsListResponse>(`/ingredients?${params}`);
  }

  async getIngredient(id: number): Promise<IngredientResponse> {
    return this.request<IngredientResponse>(`/ingredients/${id}`);
  }

  async createIngredient(ingredientData: CreateIngredientRequest): Promise<IngredientResponse> {
    return this.request<IngredientResponse>('/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredientData),
    });
  }

  async updateIngredient(id: number, updateData: UpdateIngredientRequest): Promise<IngredientResponse> {
    return this.request<IngredientResponse>(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteIngredient(id: number): Promise<IngredientResponse> {
    return this.request<IngredientResponse>(`/ingredients/${id}`, {
      method: 'DELETE',
    });
  }

  // Dishes API methods
  async getDishes(page: number = 1, limit: number = 10): Promise<DishesListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request<DishesListResponse>(`/dishes?${params}`);
  }

  async getDish(id: number): Promise<DishResponse> {
    return this.request<DishResponse>(`/dishes/${id}`);
  }

  async createDish(dishData: CreateDishRequest): Promise<DishResponse> {
    return this.request<DishResponse>('/dishes', {
      method: 'POST',
      body: JSON.stringify(dishData),
    });
  }

  async updateDish(id: number, updateData: UpdateDishRequest): Promise<DishResponse> {
    return this.request<DishResponse>(`/dishes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteDish(id: number): Promise<DishResponse> {
    return this.request<DishResponse>(`/dishes/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API methods
  async getCategories(): Promise<CategoriesListResponse> {
    return this.request<CategoriesListResponse>('/categories');
  }
}

export const apiClient = new ApiClient();
