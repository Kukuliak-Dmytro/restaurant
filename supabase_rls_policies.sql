-- Enable RLS on restaurant_locations table
ALTER TABLE restaurant_locations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to read all locations
CREATE POLICY "Allow authenticated users to read locations" ON restaurant_locations
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow admins to insert, update, delete locations
CREATE POLICY "Allow admins to manage locations" ON restaurant_locations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN role r ON e.role_id = r.id
    WHERE e.email = auth.jwt() ->> 'email'
    AND r.id = 7  -- Admin role ID
  )
);

-- Enable RLS on employees table (if not already enabled)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy for employees: Users can read their own record and records from their location
CREATE POLICY "Employees can read own and location records" ON employees
FOR SELECT
TO authenticated
USING (
  email = auth.jwt() ->> 'email'  -- Own record
  OR 
  location_id = (
    SELECT location_id FROM employees 
    WHERE email = auth.jwt() ->> 'email'
  )  -- Same location
);

-- Policy for employees: Users can update their own record
CREATE POLICY "Employees can update own record" ON employees
FOR UPDATE
TO authenticated
USING (email = auth.jwt() ->> 'email')
WITH CHECK (email = auth.jwt() ->> 'email');

-- Policy for employees: Users can insert their own record
CREATE POLICY "Employees can insert own record" ON employees
FOR INSERT
TO authenticated
WITH CHECK (email = auth.jwt() ->> 'email');

-- Policy for admins: Full access to employees
CREATE POLICY "Admins can manage all employees" ON employees
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN role r ON e.role_id = r.id
    WHERE e.email = auth.jwt() ->> 'email'
    AND r.id = 7  -- Admin role ID
  )
);

-- Enable RLS on role table (if not already enabled)
ALTER TABLE role ENABLE ROW LEVEL SECURITY;

-- Policy for roles: All authenticated users can read roles
CREATE POLICY "Allow authenticated users to read roles" ON role
FOR SELECT
TO authenticated
USING (true);

-- Policy for admins: Full access to roles
CREATE POLICY "Admins can manage roles" ON role
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN role r ON e.role_id = r.id
    WHERE e.email = auth.jwt() ->> 'email'
    AND r.id = 7  -- Admin role ID
  )
);

-- Enable RLS on employees_schedule table
ALTER TABLE employees_schedule ENABLE ROW LEVEL SECURITY;

-- Policy for schedule: Users can read schedules from their location
CREATE POLICY "Employees can read schedules from their location" ON employees_schedule
FOR SELECT
TO authenticated
USING (
  location_id = (
    SELECT location_id FROM employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy for schedule: Admins can manage all schedules
CREATE POLICY "Admins can manage all schedules" ON employees_schedule
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN role r ON e.role_id = r.id
    WHERE e.email = auth.jwt() ->> 'email'
    AND r.id = 7  -- Admin role ID
  )
);

-- Enable RLS on shifts table
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Policy for shifts: Users can read shifts from their location
CREATE POLICY "Employees can read shifts from their location" ON shifts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.email = auth.jwt() ->> 'email'
    AND e.location_id = (
      SELECT location_id FROM employees_schedule es
      WHERE es.shift_date = shifts.shift_date
      LIMIT 1
    )
  )
);

-- Policy for shifts: Admins can manage all shifts
CREATE POLICY "Admins can manage all shifts" ON shifts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN role r ON e.role_id = r.id
    WHERE e.email = auth.jwt() ->> 'email'
    AND r.id = 7  -- Admin role ID
  )
);

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees e
    JOIN role r ON e.role_id = r.id
    WHERE e.email = auth.jwt() ->> 'email'
    AND r.id = 7  -- Admin role ID
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user's location_id
CREATE OR REPLACE FUNCTION get_user_location_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT location_id FROM employees 
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
