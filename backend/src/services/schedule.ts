import supabase from '../utils/supabase';
import { Schedule, Shift, EmployeeSchedule, ScheduleRequest, ScheduleResponse } from '../types/schedule';

export class ScheduleService {
    async getScheduleByDateRange(
        locationId: number, 
        startDate: string, 
        endDate: string
    ): Promise<ScheduleResponse> {
        try {
            const { data, error } = await supabase
                .from('employees_schedule')
                .select(`
                    shift_date,
                    employee_id,
                    location_id,
                    created_at,
                    updated_at,
                    employee:employee_id (
                        id,
                        full_name,
                        role_id,
                        role:role_id (
                            id,
                            name,
                            description,
                            shift_pay
                        )
                    )
                `)
                .eq('location_id', locationId)
                .gte('shift_date', startDate)
                .lte('shift_date', endDate);

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: 'Schedule data retrieved successfully'
            };
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch schedule'
            };
        }
    }

    async assignEmployeeToShift(scheduleData: ScheduleRequest): Promise<ScheduleResponse> {
        try {
            // Check if employee is already assigned to this shift
            const { data: existingAssignment } = await supabase
                .from('employees_schedule')
                .select('*')
                .eq('employee_id', scheduleData.employee_id)
                .eq('shift_date', scheduleData.shift_date)
                .eq('location_id', scheduleData.location_id)
                .single();

            if (existingAssignment) {
                return {
                    success: false,
                    error: 'Employee is already assigned to this shift'
                };
            }

            // Create the assignment
            const { data, error } = await supabase
                .from('employees_schedule')
                .insert([scheduleData])
                .select()
                .single();

            if (error) throw error;

            // Ensure shift record exists
            await this.ensureShiftExists(scheduleData.shift_date);

            return {
                success: true,
                data,
                message: 'Employee assigned to shift successfully'
            };
        } catch (error) {
            console.error('Error assigning employee to shift:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to assign employee to shift'
            };
        }
    }

    async removeEmployeeFromShift(
        employeeId: string, 
        shiftDate: string, 
        locationId: number
    ): Promise<ScheduleResponse> {
        try {
            const { error } = await supabase
                .from('employees_schedule')
                .delete()
                .eq('employee_id', employeeId)
                .eq('shift_date', shiftDate)
                .eq('location_id', locationId);

            if (error) throw error;

            return {
                success: true,
                message: 'Employee removed from shift successfully'
            };
        } catch (error) {
            console.error('Error removing employee from shift:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove employee from shift'
            };
        }
    }

    async getEmployeesByLocation(locationId: number): Promise<ScheduleResponse> {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select(`
                    id,
                    full_name,
                    role_id,
                    location_id,
                    role:role_id (
                        id,
                        name,
                        description,
                        shift_pay
                    )
                `)
                .eq('location_id', locationId);

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: 'Employees retrieved successfully'
            };
        } catch (error) {
            console.error('Error fetching employees:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch employees'
            };
        }
    }

    async getRoles(): Promise<ScheduleResponse> {
        try {
            const { data, error } = await supabase
                .from('role')
                .select('*');

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: 'Roles retrieved successfully'
            };
        } catch (error) {
            console.error('Error fetching roles:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch roles'
            };
        }
    }

    async getLocations(): Promise<ScheduleResponse> {
        try {
            const { data, error } = await supabase
                .from('restaurant_locations')
                .select('*');

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                message: 'Locations retrieved successfully'
            };
        } catch (error) {
            console.error('Error fetching locations:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch locations'
            };
        }
    }

    private async ensureShiftExists(shiftDate: string): Promise<void> {
        try {
            const { data: existingShift } = await supabase
                .from('shifts')
                .select('shift_date')
                .eq('shift_date', shiftDate)
                .single();

            if (!existingShift) {
                const { error } = await supabase
                    .from('shifts')
                    .insert({
                        shift_date: shiftDate,
                        started_at: new Date().toISOString()
                    });

                if (error) throw error;
            }
        } catch (error) {
            console.error('Error ensuring shift exists:', error);
            throw error;
        }
    }

    async validateSchedulePermissions(userId: string): Promise<ScheduleResponse> {
        try {
            console.log('🔐 [Backend] Validating schedule permissions for user:', userId);
            
            // Get user's employee record to check role
            const { data: employee, error: employeeError } = await supabase
                .from('employees')
                .select(`
                    role_id,
                    role:role_id (
                        id,
                        name
                    )
                `)
                .eq('id', userId)
                .single();

            console.log('🔐 [Backend] Employee lookup result:', {
                hasEmployee: !!employee,
                roleId: employee?.role_id,
                roleName: (employee?.role as any)?.name,
                error: employeeError?.message || 'None'
            });

            if (employeeError || !employee) {
                console.log('🔐 [Backend] Employee record not found for user:', userId);
                return {
                    success: false,
                    error: 'Employee record not found'
                };
            }

            const isAdmin = employee.role_id === 7; // Admin role ID
            
            console.log('🔐 [Backend] Permission calculation:', {
                roleId: employee.role_id,
                isAdmin,
                adminRoleId: 7
            });

            const permissions = {
                canView: true,
                canEdit: isAdmin,
                canDelete: isAdmin,
                canCreate: isAdmin,
                isAdmin,
                roleId: employee.role_id,
                roleName: (employee.role as any)?.name || 'Unknown'
            };

            console.log('🔐 [Backend] Final permissions:', permissions);

            return {
                success: true,
                data: permissions,
                message: 'Permissions validated successfully'
            };
        } catch (error) {
            console.error('🔐 [Backend] Error validating permissions:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to validate permissions'
            };
        }
    }
}
