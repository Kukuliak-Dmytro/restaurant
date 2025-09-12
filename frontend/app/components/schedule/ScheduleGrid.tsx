import type { ScheduleWeek, Employee, Role } from '../../types/schedule';
import EmployeeCard from './EmployeeCard';
import { getScheduleCompletionStatus } from '../../utils/scheduleValidation';

interface ScheduleGridProps {
  scheduleWeek: ScheduleWeek;
  employees: Employee[];
  roles: Role[];
  onAssignEmployee: (employeeId: string, date: string) => void;
  canEdit: boolean;
  isSaving: boolean;
  selectedShiftDate?: string;
  onCreateShift?: (date: string) => void;
  existingShifts?: string[]; // Array of dates that have shifts
  pendingOperations?: Set<string>; // Set of pending operation keys
  mutationStatus?: {
    assignEmployee: boolean;
    createShift: boolean;
    saveSchedule: boolean;
  };
}

export default function ScheduleGrid({ 
  scheduleWeek, 
  employees, 
  roles, 
  onAssignEmployee, 
  canEdit,
  isSaving,
  selectedShiftDate,
  onCreateShift,
  existingShifts = [],
  pendingOperations = new Set(),
  mutationStatus
}: ScheduleGridProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  const getEmployeesByRole = (roleId: number) => {
    return employees.filter(emp => emp.role_id === roleId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedShiftDate ? `Schedule - Selected: ${formatDate(selectedShiftDate).day}, ${formatDate(selectedShiftDate).month} ${formatDate(selectedShiftDate).date}` : 'Schedule Grid'}
          </h2>
          <div className="text-sm text-gray-600">
            Overall Completion: <span className="font-medium">{scheduleWeek.overallCompletion}%</span>
            {mutationStatus && (mutationStatus.assignEmployee || mutationStatus.createShift || mutationStatus.saveSchedule) && (
              <span className="ml-2 text-blue-600 text-sm">
                ({mutationStatus.assignEmployee && 'assigning... '}
                 {mutationStatus.createShift && 'creating shift... '}
                 {mutationStatus.saveSchedule && 'saving... '})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header Row */}
          <div className="grid grid-cols-8 bg-gray-50 border-b">
            <div className="px-4 py-3 text-sm font-medium text-gray-700 border-r">
              Employee / Role
            </div>
            {scheduleWeek.days.map((day) => {
              const { day: dayName, date, month } = formatDate(day.date);
              const status = getScheduleCompletionStatus(day);
              const isSelected = selectedShiftDate === day.date;
              const hasShift = existingShifts.includes(day.date); // Check if shift exists in database
              
              return (
                <div key={day.date} className={`px-4 py-3 text-center border-r last:border-r-0 ${
                  isSelected ? 'bg-blue-50 border-blue-200' : ''
                }`}>
                  <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {dayName}
                  </div>
                  <div className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                    {month} {date}
                  </div>
                  
                  {hasShift ? (
                    <div className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      status.color === 'green' ? 'bg-green-100 text-green-800' :
                      status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {status.message}
                    </div>
                  ) : (
                    <div className="mt-1">
                      {canEdit && onCreateShift && (
                        <button
                          onClick={() => onCreateShift(day.date)}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center w-6 h-6 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full border border-gray-300 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Create shift"
                        >
                          +
                        </button>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        No shift
                      </div>
                    </div>
                  )}
                  
                  {isSelected && (
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Employee Rows */}
          {roles.map((role) => (
            <div key={role.id} className="border-b last:border-b-0">
              <div className="grid grid-cols-8">
                {/* Role Header */}
                <div className="px-4 py-3 bg-gray-50 border-r">
                  <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  <div className="text-xs text-gray-600">{role.description}</div>
                </div>

                {/* Employee Cards for each day */}
                {scheduleWeek.days.map((day) => {
                  const isSelected = selectedShiftDate === day.date;
                  
                  return (
                    <div key={`${role.id}-${day.date}`} className={`px-2 py-3 border-r last:border-r-0 ${
                      isSelected ? 'bg-blue-25' : ''
                    }`}>
                      <div className="space-y-1">
                        {day.employees
                          .filter(emp => emp.employee?.role_id === role.id)
                          .map((empSchedule) => (
                            <EmployeeCard
                              key={empSchedule.employee_id}
                              employee={empSchedule.employee!}
                              onRemove={() => onAssignEmployee(empSchedule.employee_id, day.date)}
                              canEdit={canEdit && (!selectedShiftDate || isSelected)}
                              isSaving={pendingOperations.has(`${empSchedule.employee_id}-${day.date}`)}
                            />
                          ))}
                        
                        {/* Available employees to assign */}
                        {canEdit && (!selectedShiftDate || isSelected) && (
                          <div className="space-y-1">
                            {getEmployeesByRole(role.id)
                              .filter(emp => !day.employees.some(dayEmp => dayEmp.employee_id === emp.id))
                              .map((employee) => (
                                <button
                                  key={employee.id}
                                  onClick={() => onAssignEmployee(employee.id, day.date)}
                                  disabled={pendingOperations.has(`${employee.id}-${day.date}`)}
                                  className="w-full text-left px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {pendingOperations.has(`${employee.id}-${day.date}`) ? '...' : '+'} {employee.full_name}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}