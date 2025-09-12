import type { ScheduleWeek, Role } from '../../types/schedule';
import { getMissingRoles, getCompletionPercentage } from '../../utils/roleRequirements';

interface RoleRequirementsPanelProps {
  scheduleWeek: ScheduleWeek;
  roles: Role[];
}

export default function RoleRequirementsPanel({ scheduleWeek, roles }: RoleRequirementsPanelProps) {
  const getDayStatus = (day: any) => {
    const missingRoles = getMissingRoles(day.roleRequirements);
    const completionPercentage = getCompletionPercentage(day.roleRequirements);
    
    if (completionPercentage === 100) {
      return { status: 'complete', color: 'green', message: 'All roles assigned' };
    } else if (missingRoles.length === day.roleRequirements.length) {
      return { status: 'critical', color: 'red', message: 'No roles assigned' };
    } else {
      return { status: 'incomplete', color: 'yellow', message: `${missingRoles.length} roles missing` };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Role Requirements Status</h3>
        <p className="text-sm text-gray-600 mt-1">
          Track which roles are assigned for each day
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {scheduleWeek.days.map((day) => {
            const status = getDayStatus(day);
            const missingRoles = getMissingRoles(day.roleRequirements);
            
            return (
              <div key={day.date} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    {formatDate(day.date)}
                  </h4>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    status.color === 'green' ? 'bg-green-100 text-green-800' :
                    status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status.message}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {day.roleRequirements.map((requirement) => (
                    <div
                      key={requirement.role_id}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        requirement.assigned
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {requirement.role_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {requirement.assigned 
                            ? `${requirement.assignedEmployees.length} assigned`
                            : 'Not assigned'
                          }
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        requirement.assigned ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>
                  ))}
                </div>

                {missingRoles.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-sm font-medium text-red-800 mb-1">
                      Missing Roles:
                    </div>
                    <div className="text-sm text-red-700">
                      {missingRoles.map(role => role.role_name).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Week Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {scheduleWeek.days.filter(day => getDayStatus(day).status === 'complete').length}
              </div>
              <div className="text-gray-600">Complete Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {scheduleWeek.days.filter(day => getDayStatus(day).status === 'incomplete').length}
              </div>
              <div className="text-gray-600">Incomplete Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {scheduleWeek.days.filter(day => getDayStatus(day).status === 'critical').length}
              </div>
              <div className="text-gray-600">Critical Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
