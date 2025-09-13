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
  const { permissions, currentUser, loading: permissionsLoading } = usePermissions();
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

  // Auto-select user's location when currentUser is loaded (for all users including admins)
  useEffect(() => {
    if (currentUser?.location_id && locations.length > 0) {
      const userLocation = locations.find(loc => loc.id === currentUser.location_id);
      if (userLocation) {
        setSelectedLocation(currentUser.location_id);
        console.log('Auto-selected user location:', userLocation);
      } else {
        console.warn('User location not found in available locations:', {
          userLocationId: currentUser.location_id,
          availableLocations: locations.map(loc => ({ id: loc.id, address: loc.address }))
        });
      }
    }
  }, [currentUser, locations]);
  
  // If user doesn't have a location and is not admin, show warning
  useEffect(() => {
    if (currentUser && !currentUser.location_id && !permissions?.isAdmin) {
      console.warn('User does not have a location assigned:', currentUser);
    }
  }, [currentUser, permissions?.isAdmin]);
  
  // Debug current user data
  useEffect(() => {
    if (currentUser) {
      console.log('Schedule debug - currentUser:', {
        id: currentUser.id,
        full_name: currentUser.full_name,
        location_id: currentUser.location_id,
        role_id: currentUser.role_id,
        role: currentUser.role
      });
    }
  }, [currentUser]);
  
  // Debug locations data
  useEffect(() => {
    if (locations.length > 0) {
      console.log('Schedule debug - locations:', locations.map(loc => ({ id: loc.id, address: loc.address })));
    }
  }, [locations]);

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
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Setup Required</h2>
              <p className="text-gray-600 mb-6">
                You need to complete your employee profile before accessing the schedule.
              </p>
            </div>
            
            <div className="space-y-4">
              <a 
                href="/profile" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Your Profile
              </a>
              <div className="text-sm text-gray-500">
                Make sure to fill in your role and location information
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Creator</h1>
              <p className="text-gray-600">
                {permissions.isAdmin ? 'Manage employee schedules' : 'View employee schedules'}
              </p>
            </div>
            {currentUser && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Logged in as:</div>
                <div className="font-medium text-gray-900">{currentUser.full_name}</div>
                <div className="text-sm text-gray-500">{currentUser.role?.name}</div>
                {currentUser.location_id && (
                  <div className="text-xs text-blue-600 mt-1">
                    📍 {locations.find(loc => loc.id === currentUser.location_id)?.address || `Location ID: ${currentUser.location_id}`}
                  </div>
                )}
                {!currentUser.location_id && !permissions?.isAdmin && (
                  <div className="text-xs text-yellow-600 mt-1">
                    ⚠️ No location assigned
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <LocationSelector
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              loading={employeesLoading}
              currentUserLocationId={currentUser?.location_id}
              canEdit={permissions.canEditSchedules}
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
              canEdit={permissions.canEditSchedules}
            />

            {permissions.canEditSchedules ? (
              <ScheduleActions
                onSave={handleSaveSchedule}
                isSaving={saveScheduleMutation.isPending}
                saveError={saveError}
                scheduleWeek={scheduleWeek || null}
              />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Read-only Mode</div>
                    <div className="text-xs text-yellow-600">You can view schedules but cannot make changes</div>
                  </div>
                </div>
              </div>
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
                  currentUserId={currentUser?.id}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
