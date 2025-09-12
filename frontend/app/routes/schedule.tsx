import { useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { 
  useScheduleDataQuery, 
  useEmployeesQuery, 
  useRolesQuery, 
  useShiftsQuery,
  useLocationsQuery 
} from '../hooks/queries/useScheduleQueries';
import { 
  useAssignEmployeeMutation, 
  useCreateShiftMutation, 
  useSaveScheduleMutation,
  useOptimisticScheduleUpdate 
} from '../hooks/mutations/useScheduleMutations';
import WeekSelector from '../components/schedule/WeekSelector';
import LocationSelector from '../components/schedule/LocationSelector';
import ScheduleGrid from '../components/schedule/ScheduleGrid';
import AccessDenied from '../components/schedule/AccessDenied';
import ScheduleActions from '../components/schedule/ScheduleActions';
import ShiftManager from '../components/schedule/ShiftManager';
import type { ScheduleDay, EmployeeSchedule, ScheduleWeek } from '../types/schedule';

export default function ScheduleCreator() {
  const { permissions, loading: permissionsLoading } = usePermissions();
  const [selectedLocation, setSelectedLocation] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  });
  // TanStack Query hooks
  const { 
    data: scheduleWeek, 
    isLoading: scheduleLoading, 
    error: scheduleError 
  } = useScheduleDataQuery(selectedLocation, selectedWeek.start, selectedWeek.end);

  const { 
    data: employees = [], 
    isLoading: employeesLoading 
  } = useEmployeesQuery(selectedLocation);

  const { 
    data: roles = [], 
    isLoading: rolesLoading 
  } = useRolesQuery();

  const { 
    data: existingShifts = [] 
  } = useShiftsQuery(selectedLocation, selectedWeek.start, selectedWeek.end);

  const { 
    data: locations = [] 
  } = useLocationsQuery();

  // Mutations
  const assignEmployeeMutation = useAssignEmployeeMutation();
  const createShiftMutation = useCreateShiftMutation();
  const saveScheduleMutation = useSaveScheduleMutation();

  // Optimistic updates
  const { updateScheduleOptimistically, revertScheduleUpdate } = useOptimisticScheduleUpdate();

  const [selectedShiftDate, setSelectedShiftDate] = useState<string>('');
  const [saveError, setSaveError] = useState<string | null>(null);



  const handleAssignEmployee = (employeeId: string, date: string) => {
    if (!permissions?.canEditSchedules) return;

    // Check if employee is already assigned
    const existingAssignment = scheduleWeek?.days
      .find((day: any) => day.date === date)
      ?.employees.find((emp: any) => emp.employee_id === employeeId);

    const isAdding = !existingAssignment;

    // Optimistic update
    updateScheduleOptimistically(
      selectedLocation,
      selectedWeek.start,
      selectedWeek.end,
      employeeId,
      date,
      isAdding
    );

    // Execute mutation
    assignEmployeeMutation.mutate(
      { employeeId, date, locationId: selectedLocation },
      {
        onError: () => {
          // Revert optimistic update on error
          revertScheduleUpdate(
            selectedLocation,
            selectedWeek.start,
            selectedWeek.end,
            employeeId,
            date,
            isAdding
          );
        }
      }
    );
  };

  const handleCreateShift = (date: string) => {
    if (!permissions?.canEditSchedules) return;

    createShiftMutation.mutate(
      { date, locationId: selectedLocation },
      {
        onError: (error: any) => {
          setSaveError(error instanceof Error ? error.message : 'Failed to create shift');
        }
      }
    );
  };

  const handleSaveSchedule = () => {
    if (!permissions?.canEditSchedules || !scheduleWeek) return;

    saveScheduleMutation.mutate(
      { scheduleWeek, locationId: selectedLocation },
      {
        onError: (error: any) => {
          setSaveError(error instanceof Error ? error.message : 'Failed to save schedule');
        }
      }
    );
  };

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading permissions...</div>
      </div>
    );
  }

  if (!permissions?.canViewSchedules) {
    return <AccessDenied />;
  }

  if (scheduleLoading || employeesLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg mb-2">Loading schedule data...</div>
          <div className="text-sm text-gray-500">
            {scheduleLoading && 'Schedule data... '}
            {employeesLoading && 'Employees... '}
            {rolesLoading && 'Roles... '}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Creator</h1>
          <p className="text-gray-600">
            {permissions.isAdmin ? 'Manage employee schedules' : 'View employee schedules'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <LocationSelector
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              loading={employeesLoading}
            />
            
            <WeekSelector
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
            />

            <ShiftManager
              startDate={selectedWeek.start}
              endDate={selectedWeek.end}
              onShiftSelect={setSelectedShiftDate}
              selectedShiftDate={selectedShiftDate}
            />

            {permissions.canEditSchedules && (
              <ScheduleActions
                onSave={handleSaveSchedule}
                isSaving={saveScheduleMutation.isPending}
                saveError={saveError}
                scheduleWeek={scheduleWeek}
              />
            )}
          </div>

          {/* Main Schedule Area */}
          <div className="lg:col-span-3">
            {scheduleLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading schedule...</div>
              </div>
            ) : scheduleError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium">Error Loading Schedule</h3>
                <p className="text-red-600 mt-1">
                  {scheduleError instanceof Error ? scheduleError.message : 'Failed to load schedule data'}
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : scheduleWeek ? (
              <div className="space-y-4">
                <ScheduleGrid
                  scheduleWeek={scheduleWeek}
                  employees={employees}
                  roles={roles}
                  onAssignEmployee={handleAssignEmployee}
                  canEdit={permissions.canEditSchedules}
                  isSaving={assignEmployeeMutation.isPending || createShiftMutation.isPending || saveScheduleMutation.isPending}
                  mutationStatus={{
                    assignEmployee: assignEmployeeMutation.isPending,
                    createShift: createShiftMutation.isPending,
                    saveSchedule: saveScheduleMutation.isPending
                  }}
                  selectedShiftDate={selectedShiftDate}
                  onCreateShift={handleCreateShift}
                  existingShifts={existingShifts}
                  pendingOperations={new Set()} // TanStack Query handles this automatically
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
