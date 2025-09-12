import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { scheduleKeys } from '../queries/useScheduleQueries';

interface AssignEmployeeParams {
  employeeId: string;
  date: string;
  locationId: number;
}

interface CreateShiftParams {
  date: string;
  locationId: number;
}

interface SaveScheduleParams {
  scheduleWeek: any;
  locationId: number;
}

// Mutation hooks
export const useAssignEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, date, locationId }: AssignEmployeeParams) => {
      // Check if employee is already assigned
      const { data: existingAssignment } = await supabase
        .from('employees_schedule')
        .select('employee_id')
        .eq('employee_id', employeeId)
        .eq('shift_date', date)
        .eq('location_id', locationId)
        .single();

      if (existingAssignment) {
        // Remove assignment
        const { error } = await supabase
          .from('employees_schedule')
          .delete()
          .eq('employee_id', employeeId)
          .eq('shift_date', date)
          .eq('location_id', locationId);

        if (error) throw error;
        return { action: 'remove', employeeId, date };
      } else {
        // Add assignment
        const { error } = await supabase
          .from('employees_schedule')
          .insert({
            employee_id: employeeId,
            shift_date: date,
            location_id: locationId
          });

        if (error) throw error;
        return { action: 'add', employeeId, date };
      }
    },
    onSuccess: (result, variables) => {
      // Invalidate relevant queries
      const { date, locationId } = variables;
      
      // Find the date range that includes this date
      const dateObj = new Date(date);
      const startOfWeek = new Date(dateObj);
      startOfWeek.setDate(dateObj.getDate() - dateObj.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];

      queryClient.invalidateQueries({
        queryKey: scheduleKeys.scheduleData(locationId, startDate, endDate)
      });
    },
    onError: (error) => {
      console.error('Error assigning employee:', error);
    }
  });
};

export const useCreateShiftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, locationId }: CreateShiftParams) => {
      // Get current user ID from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create shift record with admin_id
      const { error } = await supabase
        .from('shifts')
        .insert({
          shift_date: date,
          started_at: new Date().toISOString(),
          admin_id: user.id
        });

      if (error) throw error;
      return { date, locationId };
    },
    onSuccess: (result) => {
      const { date, locationId } = result;
      
      // Find the date range that includes this date
      const dateObj = new Date(date);
      const startOfWeek = new Date(dateObj);
      startOfWeek.setDate(dateObj.getDate() - dateObj.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];

      // Invalidate shifts query
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.shifts(locationId, startDate, endDate)
      });
    },
    onError: (error) => {
      console.error('Error creating shift:', error);
    }
  });
};

export const useSaveScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduleWeek, locationId }: SaveScheduleParams) => {
      // Get current user ID from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create shift records for each day
      for (const day of scheduleWeek.days) {
        if (day.employees.length > 0) {
          // Check if shift exists
          const { data: existingShift } = await supabase
            .from('shifts')
            .select('shift_date')
            .eq('shift_date', day.date)
            .single();

          if (!existingShift) {
            // Create shift record with admin_id
            const { error: shiftError } = await supabase
              .from('shifts')
              .insert({
                shift_date: day.date,
                started_at: new Date().toISOString(),
                admin_id: user.id
              });

            if (shiftError) throw shiftError;
          }
        }
      }

      return { scheduleWeek, locationId };
    },
    onSuccess: (result) => {
      const { scheduleWeek, locationId } = result;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.scheduleData(locationId, scheduleWeek.startDate, scheduleWeek.endDate)
      });
      
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.shifts(locationId, scheduleWeek.startDate, scheduleWeek.endDate)
      });
    },
    onError: (error) => {
      console.error('Error saving schedule:', error);
    }
  });
};

// Optimistic update utilities
export const useOptimisticScheduleUpdate = () => {
  const queryClient = useQueryClient();

  const updateScheduleOptimistically = (
    locationId: number,
    startDate: string,
    endDate: string,
    employeeId: string,
    date: string,
    isAdding: boolean
  ) => {
    const queryKey = scheduleKeys.scheduleData(locationId, startDate, endDate);
    
    queryClient.setQueryData(queryKey, (oldData: ScheduleWeek | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        days: oldData.days.map(day => {
          if (day.date !== date) return day;

          if (isAdding) {
            // Check if already assigned
            const alreadyAssigned = day.employees.some(emp => emp.employee_id === employeeId);
            if (alreadyAssigned) return day;

            // Add employee (we'll need employee data from another query)
            return {
              ...day,
              employees: [...day.employees, {
                employee_id: employeeId,
                name: '', // Will be filled by actual data
                role_id: '',
                role_name: '',
                employee: null
              }]
            };
          } else {
            return {
              ...day,
              employees: day.employees.filter(emp => emp.employee_id !== employeeId)
            };
          }
        })
      };
    });
  };

  const revertScheduleUpdate = (
    locationId: number,
    startDate: string,
    endDate: string,
    employeeId: string,
    date: string,
    isAdding: boolean
  ) => {
    // Revert the optimistic update
    updateScheduleOptimistically(locationId, startDate, endDate, employeeId, date, !isAdding);
  };

  return {
    updateScheduleOptimistically,
    revertScheduleUpdate
  };
};
