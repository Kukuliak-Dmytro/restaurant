import { usePermissions } from '../hooks/usePermissions';
import { useLocationsQuery } from '../hooks/queries/useScheduleQueries';

export default function DebugUserInfo() {
  const { permissions, currentUser, loading, error } = usePermissions();
  const { data: locations, isLoading: locationsLoading, error: locationsError } = useLocationsQuery();

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded">Loading user data...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded text-sm">
      <h3 className="font-bold mb-2">Debug User Info</h3>
      <div className="space-y-1">
        <div><strong>User Error:</strong> {error || 'None'}</div>
        <div><strong>Locations Error:</strong> {locationsError?.message || 'None'}</div>
        <div><strong>Locations Loading:</strong> {locationsLoading ? 'Yes' : 'No'}</div>
        <div><strong>Locations Count:</strong> {locations?.length || 0}</div>
        <div><strong>Permissions:</strong> {JSON.stringify(permissions, null, 2)}</div>
        <div><strong>Current User:</strong> {JSON.stringify(currentUser, null, 2)}</div>
        <div><strong>Locations:</strong> {JSON.stringify(locations, null, 2)}</div>
        
        {locationsError && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="text-yellow-800 font-medium">RLS Issue Detected</div>
            <div className="text-yellow-700 text-xs mt-1">
              If you see "permission denied" errors, you need to set up RLS policies.
              Check the RLS_SETUP_INSTRUCTIONS.md file for setup instructions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
