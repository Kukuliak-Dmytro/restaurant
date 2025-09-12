import supabase from '../utils/supabase';
import { Shift, ShiftRequest, ShiftResponse } from '../types/schedule';

export class ShiftService {
    async createShift(shiftData: ShiftRequest): Promise<ShiftResponse> {
        try {
            const { data, error } = await supabase
                .from('shifts')
                .insert([{
                    shift_date: shiftData.shift_date,
                    profit: shiftData.profit || 0,
                    started_at: shiftData.started_at || new Date().toISOString(),
                    admin_id: shiftData.admin_id
                }])
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Shift created successfully'
            };
        } catch (error) {
            console.error('Error creating shift:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create shift'
            };
        }
    }

    async getShiftsByDateRange(startDate: string, endDate: string): Promise<ShiftResponse> {
        try {
            const { data, error } = await supabase
                .from('shifts')
                .select('*')
                .gte('shift_date', startDate)
                .lte('shift_date', endDate)
                .order('shift_date', { ascending: true });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: 'Shifts retrieved successfully'
            };
        } catch (error) {
            console.error('Error fetching shifts:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch shifts'
            };
        }
    }

    async getShiftByDate(shiftDate: string): Promise<ShiftResponse> {
        try {
            const { data, error } = await supabase
                .from('shifts')
                .select('*')
                .eq('shift_date', shiftDate)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return {
                        success: false,
                        error: 'Shift not found'
                    };
                }
                throw error;
            }

            return {
                success: true,
                data,
                message: 'Shift retrieved successfully'
            };
        } catch (error) {
            console.error('Error fetching shift:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch shift'
            };
        }
    }

    async updateShift(shiftDate: string, shiftData: Partial<ShiftRequest>): Promise<ShiftResponse> {
        try {
            const { data, error } = await supabase
                .from('shifts')
                .update({
                    ...shiftData,
                    updated_at: new Date().toISOString()
                })
                .eq('shift_date', shiftDate)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Shift updated successfully'
            };
        } catch (error) {
            console.error('Error updating shift:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update shift'
            };
        }
    }

    async deleteShift(shiftDate: string): Promise<ShiftResponse> {
        try {
            const { error } = await supabase
                .from('shifts')
                .delete()
                .eq('shift_date', shiftDate);

            if (error) throw error;

            return {
                success: true,
                message: 'Shift deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting shift:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete shift'
            };
        }
    }

    async shiftExists(shiftDate: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('shifts')
                .select('shift_date')
                .eq('shift_date', shiftDate)
                .single();

            return !error && !!data;
        } catch (error) {
            return false;
        }
    }
}
