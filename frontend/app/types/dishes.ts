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

export interface DishResponse {
  success: boolean;
  data?: Dish;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  data: Dish[];
}

export interface DishesListResponse {
  success: boolean;
  data?: PaginationInfo;
  error?: string;
}

export interface CategoriesListResponse {
  success: boolean;
  data?: Category[];
  error?: string;
}
