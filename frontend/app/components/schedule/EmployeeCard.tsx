import type { Employee } from '../../types/schedule';

interface EmployeeCardProps {
  employee: Employee;
  onRemove: () => void;
  canEdit: boolean;
  isSaving: boolean;
  isCurrentUser?: boolean;
}

export default function EmployeeCard({ employee, onRemove, canEdit, isSaving, isCurrentUser = false }: EmployeeCardProps) {
  return (
    <div className={`group relative rounded-md p-2 transition-colors ${
      isCurrentUser 
        ? 'bg-green-50 border border-green-300 hover:bg-green-100' 
        : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
    }`}>
      <div className={`text-xs font-medium truncate ${
        isCurrentUser ? 'text-green-900' : 'text-blue-900'
      }`}>
        {employee.full_name}
        {isCurrentUser && <span className="ml-1 text-green-600">(You)</span>}
      </div>
      <div className={`text-xs ${
        isCurrentUser ? 'text-green-700' : 'text-blue-700'
      }`}>
        {employee.role?.name}
      </div>
      
      {canEdit && (
        <button
          onClick={onRemove}
          disabled={isSaving}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Remove ${employee.full_name}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
