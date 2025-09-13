export interface Dish {
  id: number;
  name: string;
  description?: string;
  price: number;
  rating?: number;
  category_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateDishRequest {
  name: string;
  description?: string;
  price: number;
  rating?: number;
  category_id?: number;
}

export interface UpdateDishRequest {
  name?: string;
  description?: string;
  price?: number;
  rating?: number;
  category_id?: number;
}
