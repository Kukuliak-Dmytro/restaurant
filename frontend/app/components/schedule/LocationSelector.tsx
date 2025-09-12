import type { RestaurantLocation } from '../../types/schedule';

interface LocationSelectorProps {
  locations: RestaurantLocation[];
  selectedLocation: number;
  onLocationChange: (locationId: number) => void;
  loading: boolean;
}

export default function LocationSelector({ 
  locations, 
  selectedLocation, 
  onLocationChange, 
  loading 
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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
      
      <select
        value={selectedLocation}
        onChange={(e) => onLocationChange(Number(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.address}
          </option>
        ))}
      </select>
      
      {locations.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">No locations available</p>
      )}
    </div>
  );
}
