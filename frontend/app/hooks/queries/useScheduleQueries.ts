import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { ScheduleWeek, ScheduleDay, EmployeeSchedule, RoleRequirement, ScheduleValidation, Employee, Role } from '../../types/schedule';

// Query keys
export const scheduleKeys = {
  all: ['schedule'] as const,
  employees: (locationId: number) => [...scheduleKeys.all, 'employees', locationId] as const,
  roles: () => [...scheduleKeys.all, 'roles'] as const,
  shifts: (locationId: number, startDate: string, endDate: string) => 
    [...scheduleKeys.all, 'shifts', locationId, startDate, endDate] as const,
  scheduleData: (locationId: number, startDate: string, endDate: string) => 
    [...scheduleKeys.all, 'scheduleData', locationId, startDate, endDate] as const,
};

// Helper functions
const generateDateRange = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  
  return dates;
};

const validateScheduleDay = (day: ScheduleDay): ScheduleValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if all required roles are assigned
  const missingRoles = day.roleRequirements.filter(req => req.required && !req.assigned);
  
  if (missingRoles.length > 0) {
    errors.push(`Missing required roles: ${missingRoles.map(r => r.role_name).join(', ')}`);
  }

  // Check for double-booked employees
  const employeeIds = day.employees.map(emp => emp.employee_id);
  const duplicateEmployees = employeeIds.filter((id, index) => employeeIds.indexOf(id) !== index);
  
  if (duplicateEmployees.length > 0) {
    errors.push('Some employees are assigned multiple times to the same day');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    roleRequirements: day.roleRequirements
  };
};

// Query hooks
export const useEmployeesQuery = (locationId: number) => {
  return useQuery({
    queryKey: scheduleKeys.employees(locationId),
    queryFn: async (): Promise<Employee[]> => {
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
      return data || [];
    },
    enabled: !!locationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRolesQuery = () => {
  return useQuery({
    queryKey: scheduleKeys.roles(),
    queryFn: async (): Promise<Role[]> => {
      const { data, error } = await supabase
        .from('role')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - roles change rarely
  });
};

export const useLocationsQuery = () => {
  return useQuery({
    queryKey: [...scheduleKeys.all, 'locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour - locations change very rarely
  });
};

export const useScheduleDataQuery = (locationId: number, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: scheduleKeys.scheduleData(locationId, startDate, endDate),
    queryFn: async (): Promise<ScheduleWeek> => {
      const dates = generateDateRange(startDate, endDate);
      
      // Fetch existing schedule data
      const { data: scheduleData, error: scheduleError } = await supabase
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
        .in('shift_date', dates);

      if (scheduleError) throw scheduleError;

      // Group schedule data by date
      const scheduleByDate = new Map<string, EmployeeSchedule[]>();
      scheduleData?.forEach(item => {
        if (!scheduleByDate.has(item.shift_date)) {
          scheduleByDate.set(item.shift_date, []);
        }
        scheduleByDate.get(item.shift_date)?.push(item as EmployeeSchedule);
      });

      // Get roles for validation
      const { data: roles } = await supabase.from('role').select('*');
      const rolesData = roles || [];

      // Create schedule days
      const days: ScheduleDay[] = dates.map(date => {
        const dayEmployees = scheduleByDate.get(date) || [];
        
        // Create role requirements for this day
        const roleRequirements: RoleRequirement[] = rolesData.map(role => {
          const assignedEmployees = dayEmployees.filter(emp => emp.employee?.role_id === role.id);
          return {
            role_id: role.id,
            role_name: role.name,
            required: true, // All roles are required for now
            assigned: assignedEmployees.length > 0,
            assignedEmployees: assignedEmployees.map(emp => emp.employee!).filter(Boolean)
          };
        });

        const validation = validateScheduleDay({
          date,
          location_id: locationId,
          employees: dayEmployees,
          roleRequirements,
          isComplete: false,
          completionPercentage: 0
        });

        const completionPercentage = Math.round(
          (roleRequirements.filter(req => req.assigned).length / roleRequirements.length) * 100
        );

        return {
          date,
          location_id: locationId,
          employees: dayEmployees,
          roleRequirements,
          isComplete: validation.isValid,
          completionPercentage
        };
      });

      const overallCompletion = Math.round(
        days.reduce((sum, day) => sum + day.completionPercentage, 0) / days.length
      );

      return {
        startDate,
        endDate,
        days,
        location_id: locationId,
        overallCompletion
      };
    },
    enabled: !!locationId && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useShiftsQuery = (locationId: number, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: scheduleKeys.shifts(locationId, startDate, endDate),
    queryFn: async (): Promise<string[]> => {
      const { data: shifts, error } = await supabase
        .from('shifts')
        .select('shift_date')
        .gte('shift_date', startDate)
        .lte('shift_date', endDate);

      if (error) throw error;
      return shifts?.map(shift => shift.shift_date) || [];
    },
    enabled: !!locationId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Utility hook for invalidating queries
export const useScheduleInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateScheduleData = (locationId: number, startDate: string, endDate: string) => {
    queryClient.invalidateQueries({
      queryKey: scheduleKeys.scheduleData(locationId, startDate, endDate)
    });
  };

  const invalidateShifts = (locationId: number, startDate: string, endDate: string) => {
    queryClient.invalidateQueries({
      queryKey: scheduleKeys.shifts(locationId, startDate, endDate)
    });
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: scheduleKeys.all
    });
  };

  return {
    invalidateScheduleData,
    invalidateShifts,
    invalidateAll
  };
};
