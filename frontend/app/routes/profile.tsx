import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Types for the employee data
interface Employee {
  id?: string;
  full_name: string;
  age: number | null;
  email: string;
  is_featured: boolean;
  role_id: number | null;
  location_id: number | null;
  created_at?: string;
  updated_at?: string;
}

interface Role {
  id: number;
  name: string;
}

interface RestaurantLocation {
  id: number;
  address: string;
}

export default function Profile() {
  const [employee, setEmployee] = useState<Employee>({
    full_name: "",
    age: null,
    email: "",
    is_featured: true,
    role_id: null,
    location_id: null,
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<RestaurantLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication and fetch data
  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        setIsAuthenticated(false);
        setMessage({ type: 'error', text: 'Authentication error. Please log in again.' });
        return;
      }
      
      if (!user) {
        setIsAuthenticated(false);
        setMessage({ type: 'error', text: 'Please log in to access your profile.' });
        return;
      }
      
      setIsAuthenticated(true);
      await fetchCurrentEmployee();
      await fetchRoles();
      await fetchLocations();
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    }
  };

  const fetchCurrentEmployee = async () => {
    try {
      // Get the current user from Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      if (!user) {
        console.log('No authenticated user found');
        return;
      }
      
      // Fetch employee data for the current user
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      if (data) {
        setEmployee({
          id: data.id,
          full_name: data.full_name || "",
          age: data.age,
          email: data.email || "",
          is_featured: data.is_featured,
          role_id: data.role_id,
          location_id: data.location_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
        setCurrentEmployeeId(data.id);
      }
    } catch (error) {
      console.error('Error fetching current employee:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('role')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_locations')
        .select('id, address')
        .order('address');
      
      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEmployee(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'age') {
      const ageValue = value === '' ? null : parseInt(value);
      setEmployee(prev => ({ ...prev, [name]: ageValue }));
    } else if (name === 'role_id' || name === 'location_id') {
      const idValue = value === '' ? null : parseInt(value);
      setEmployee(prev => ({ ...prev, [name]: idValue }));
    } else {
      setEmployee(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!employee.full_name.trim()) {
      errors.push('Full name is required');
    }
    
    // Role is required only when creating a new profile
    if (!currentEmployeeId && !employee.role_id) {
      errors.push('Role is required when creating a profile');
    }
    
    if (employee.age !== null && (employee.age < 0 || employee.age > 150)) {
      errors.push('Age must be between 0 and 150');
    }
    
    if (employee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
      errors.push('Please enter a valid email address');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!user) {
        throw new Error('You must be logged in to update your profile');
      }

      if (currentEmployeeId) {
        // Update existing employee (excluding role_id as it cannot be changed)
        const { data, error } = await supabase
          .from('employees')
          .update({
            full_name: employee.full_name,
            age: employee.age,
            email: employee.email,
            is_featured: employee.is_featured,
            location_id: employee.location_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentEmployeeId)
          .eq('email', user.email) // Ensure user can only update their own record
          .select()
          .single();

        if (error) throw error;

        setMessage({ type: 'success', text: 'Employee profile updated successfully!' });
      } else {
        // Create new employee if none exists
        const { data, error } = await supabase
          .from('employees')
          .insert([{
            ...employee,
            email: user.email, // Use authenticated user's email
          }])
          .select()
          .single();

        if (error) throw error;

        setCurrentEmployeeId(data.id);
        setMessage({ type: 'success', text: 'Employee profile created successfully!' });
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update employee profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication error if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Employee Profile</h1>
            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}
            <div className="text-center">
              <p className="text-gray-600 mb-4">You need to be logged in to access your profile.</p>
              <a 
                href="/login" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentEmployeeId ? '✏️ Edit Profile' : '➕ Create Profile'}
          </h1>
          <p className="text-gray-600">
            {currentEmployeeId 
              ? 'Update your personal information (role cannot be changed)' 
              : 'Complete your employee profile to get started'
            }
          </p>
        </div>
        
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {currentEmployeeId && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Role Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Your role has been set and cannot be changed after profile creation. If you need to change your role, please contact your administrator.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={employee.full_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={employee.age || ''}
                onChange={handleInputChange}
                min="0"
                max="150"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter age"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={employee.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-2">
                Role {currentEmployeeId && <span className="text-gray-500 text-sm">(Cannot be changed after profile creation)</span>}
              </label>
              {currentEmployeeId ? (
                // Show current role as read-only when editing existing profile
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 flex items-center">
                  <span className="text-lg mr-2">👤</span>
                  <span className="font-medium">
                    {employee.role_id ? roles.find(role => role.id === employee.role_id)?.name || 'Unknown Role' : 'No role selected'}
                  </span>
                </div>
              ) : (
                // Allow role selection only when creating new profile
                <select
                  id="role_id"
                  name="role_id"
                  value={employee.role_id || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a role *</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location_id" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                id="location_id"
                name="location_id"
                value={employee.location_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={employee.is_featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                Featured Employee
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : currentEmployeeId 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {currentEmployeeId ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {currentEmployeeId ? '✏️ Update Profile' : '➕ Create Profile'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}