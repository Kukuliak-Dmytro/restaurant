-- Simple RLS policies for restaurant management system

-- 1. Enable RLS on restaurant_locations
ALTER TABLE restaurant_locations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read locations
CREATE POLICY "authenticated_read_locations" ON restaurant_locations
FOR SELECT
TO authenticated
USING (true);

-- 2. Enable RLS on employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own record
CREATE POLICY "users_read_own_employee" ON employees
FOR SELECT
TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Allow users to update their own record
CREATE POLICY "users_update_own_employee" ON employees
FOR UPDATE
TO authenticated
USING (email = auth.jwt() ->> 'email')
WITH CHECK (email = auth.jwt() ->> 'email');

-- Allow users to insert their own record
CREATE POLICY "users_insert_own_employee" ON employees
FOR INSERT
TO authenticated
WITH CHECK (email = auth.jwt() ->> 'email');

-- 3. Enable RLS on role table
ALTER TABLE role ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read roles
CREATE POLICY "authenticated_read_roles" ON role
FOR SELECT
TO authenticated
USING (true);

-- 4. Enable RLS on employees_schedule
ALTER TABLE employees_schedule ENABLE ROW LEVEL SECURITY;

-- Allow users to read schedules from their location
CREATE POLICY "users_read_location_schedules" ON employees_schedule
FOR SELECT
TO authenticated
USING (
  location_id = (
    SELECT location_id FROM employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- 5. Enable RLS on shifts
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read shifts
CREATE POLICY "authenticated_read_shifts" ON shifts
FOR SELECT
TO authenticated
USING (true);

-- Helper function to check if user is admin (role_id = 7)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees e
    WHERE e.email = auth.jwt() ->> 'email'
    AND e.role_id = 7
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's location
CREATE OR REPLACE FUNCTION get_user_location()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT location_id FROM employees 
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
