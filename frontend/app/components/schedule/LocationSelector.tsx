import type { RestaurantLocation } from '../../types/schedule';

interface LocationSelectorProps {
  locations: RestaurantLocation[];
  selectedLocation: number;
  onLocationChange: (locationId: number) => void;
  loading: boolean;
  currentUserLocationId?: number;
  canEdit?: boolean;
}

export default function LocationSelector({ 
  locations, 
  selectedLocation, 
  onLocationChange, 
  loading,
  currentUserLocationId,
  canEdit = true
}: LocationSelectorProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  const currentLocation = locations.find(loc => loc.id === currentUserLocationId);
  const isCurrentUserLocation = selectedLocation === currentUserLocationId;
  
  // If user doesn't have a location assigned, show a message
  const hasUserLocation = currentUserLocationId && currentLocation;
  
  console.log('LocationSelector debug:', {
    currentUserLocationId,
    currentLocation,
    hasUserLocation,
    locationsCount: locations.length,
    canEdit,
    locations: locations.map(loc => ({ id: loc.id, address: loc.address })),
    loading
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">Location</h3>
        {!canEdit && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Auto-selected
          </span>
        )}
      </div>
      
      {canEdit ? (
        <div className="space-y-3">
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.address}
              </option>
            ))}
          </select>
          
          {/* Show admin's assigned location info */}
          {hasUserLocation && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <div className="font-medium text-blue-800">Your assigned location:</div>
                  <div className="text-blue-700">{currentLocation.address}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          {hasUserLocation ? (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">
                  {currentLocation.address}
                </div>
                <div className="text-sm text-gray-600">
                  Your assigned location
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div className="font-medium text-yellow-800">
                  {currentUserLocationId ? 'Location not found' : 'No location assigned'}
                </div>
                <div className="text-sm text-yellow-600">
                  {currentUserLocationId 
                    ? `Your assigned location (ID: ${currentUserLocationId}) is not available`
                    : 'Please update your profile to assign a location'
                  }
                </div>
                <a 
                  href="/profile" 
                  className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Go to Profile →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      
      {locations.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">No locations available</p>
      )}
      
      {isCurrentUserLocation && canEdit && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-800">This is your assigned location</span>
          </div>
        </div>
      )}
    </div>
  );
}
