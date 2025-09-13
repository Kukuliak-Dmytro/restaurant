export interface Ingredient {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateIngredientRequest {
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

export interface UpdateIngredientRequest {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
}

export interface IngredientResponse {
  success: boolean;
  data?: Ingredient;
  error?: string;
}

export interface IngredientsListResponse {
  success: boolean;
  data?: Ingredient[];
  error?: string;
}
