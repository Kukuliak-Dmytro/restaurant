import type { ShiftRequest, ShiftResponse } from '../types/schedule';
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
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
}

export const apiClient = new ApiClient();
