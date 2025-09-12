import type { ScheduleWeek } from '../../types/schedule';

interface ScheduleActionsProps {
  onSave: () => void;
  isSaving: boolean;
  saveError: string | null;
  scheduleWeek: ScheduleWeek | null;
}

export default function ScheduleActions({ onSave, isSaving, saveError, scheduleWeek }: ScheduleActionsProps) {
  const canSave = scheduleWeek && scheduleWeek.overallCompletion > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
      
      <div className="space-y-3">
        <button
          onClick={onSave}
          disabled={!canSave || isSaving}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            canSave && !isSaving
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </button>

        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-800">
              <strong>Error:</strong> {saveError}
            </div>
          </div>
        )}

        {scheduleWeek && (
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Overall Completion:</span>
              <span className="font-medium">{scheduleWeek.overallCompletion}%</span>
            </div>
            <div className="flex justify-between">
              <span>Days Scheduled:</span>
              <span className="font-medium">
                {scheduleWeek.days.filter(day => day.employees.length > 0).length} / {scheduleWeek.days.length}
              </span>
            </div>
          </div>
        )}

        {!canSave && scheduleWeek && (
          <div className="text-xs text-gray-500">
            Complete at least one day to save the schedule
          </div>
        )}
      </div>
    </div>
  );
}
