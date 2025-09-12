# Schedule Creator Implementation Prompt

## Project Overview
Create a React-based schedule creator for a restaurant management system that integrates with Supabase. The system should support role-based access control where only admin users can edit schedules, while other roles can only view them.

## Database Schema
Use the Supabase MCP tools to examine the actual database tables and their structure. Do not assume any specific column names or table structures - query the database directly to understand the current schema.

## Business Requirements

### 1. Role-Based Access Control
- **Admin Role**: Full access to create, edit, and manage schedules (role_id = 7)
- **All Other Roles**: Read-only access to view schedules
- Implement permission-based UI components that disable/hide editing features for non-admin users

### 2. Schedule Requirements
- **Role Requirements**: At least one employee from each role must be assigned to every shift
- **Location-Based**: Schedules are specific to restaurant locations
- **Day-Based Scheduling**: Use `shift_date` as the primary scheduling unit (full-day shifts)
- **Conflict Prevention**: Prevent double-booking of employees on the same date

### 3. Data Operations
- **Create Schedule**: Insert records into the appropriate tables (discover table names via MCP)
- **View Schedule**: Query and display employee assignments by date and location
- **Update Schedule**: Modify existing employee assignments
- **Delete Schedule**: Remove employee assignments (admin only)

## Technical Implementation Requirements

### 1. Component Architecture
Create the following React component structure:

```
ScheduleCreator/
├── ScheduleCreator.tsx (main container)
├── components/
│   ├── WeekSelector.tsx
│   ├── EmployeeList.tsx
│   ├── ScheduleGrid.tsx
│   ├── EmployeeCard.tsx
│   ├── RoleFilter.tsx
│   ├── LocationSelector.tsx
│   ├── RoleRequirementsPanel.tsx
│   ├── AccessDenied.tsx
│   └── ScheduleActions.tsx
├── hooks/
│   ├── useScheduleData.ts
│   ├── useEmployeeData.ts
│   ├── useRoleValidation.ts
│   └── usePermissions.ts
├── types/
│   ├── schedule.ts
│   ├── employee.ts
│   └── permissions.ts
└── utils/
    ├── scheduleValidation.ts
    └── roleRequirements.ts
```

### 2. TypeScript Interfaces
Define TypeScript interfaces based on the actual database schema discovered via MCP tools. Create interfaces that match the real table structures and column names.

### 3. Permission System
Implement a robust permission system that:
- Checks user role from authentication context
- Returns permission object based on role
- Disables UI elements for non-admin users
- Shows appropriate access denied messages
- Validates permissions on both frontend and backend

### 4. Schedule Validation
Create validation logic that:
- Ensures at least one employee from each role is assigned per shift
- Prevents employee double-booking on the same date
- Validates location assignments
- Provides real-time feedback on schedule completeness
- Prevents saving incomplete schedules

### 5. UI/UX Requirements

#### Visual Design:
- **Color Coding**: Green for complete shifts, yellow for incomplete, red for critical missing roles
- **Status Indicators**: Clear visual feedback for schedule completeness
- **Role Requirements Panel**: Shows which roles are satisfied/missing
- **Progress Indicators**: Completion percentage per day/week

#### User Experience:
- **Click-based Assignment**: Allow clicking to assign employees to specific dates (admin only)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Show loading indicators during data operations
- **Error Handling**: User-friendly error messages and validation feedback
- **Accessibility**: Keyboard navigation and screen reader support

#### Role-Specific Views:
- **Admin View**: Full editing capabilities with all controls enabled
- **Employee View**: Read-only with clear indicators of view-only mode
- **Help Text**: Contextual help explaining permission restrictions

### 6. Data Management

#### State Management:
- Use React Context or Zustand for schedule state
- Handle loading and error states gracefully
- Maintain data consistency across components

#### API Integration:
- Extend existing backend services pattern
- Use Supabase real-time subscriptions for live updates
- Implement basic data validation

### 7. Security Considerations

#### Frontend Security:
- Hide/disable editing controls for non-admin users
- Validate permissions before rendering components
- Implement proper error boundaries
- Sanitize user inputs

#### Backend Security:
- Validate user permissions on API endpoints
- Implement proper authentication checks
- Use Row Level Security (RLS) policies in Supabase
- Validate data integrity before database operations

### 8. Performance Requirements

#### Basic Optimization:
- Implement proper memoization for expensive calculations
- Optimize database queries
- Implement efficient re-rendering strategies

### 9. Basic Error Handling

#### Simple Error Handling:
- Clear validation messages
- Basic error boundaries
- Handle network failures gracefully

## Implementation Phases

### Phase 1: Core Infrastructure
1. Set up component structure and TypeScript interfaces
2. Implement permission system and role validation
3. Create basic schedule viewing functionality
4. Implement location and week selection

### Phase 2: Schedule Management
1. Build schedule grid with role requirements
2. Implement employee assignment (admin only)
3. Add schedule validation and conflict detection
4. Create save/update functionality

## Success Criteria

The implementation should:
- ✅ Enforce role-based access control correctly
- ✅ Ensure all shifts have required roles assigned
- ✅ Prevent employee double-booking
- ✅ Provide intuitive user experience for both admins and employees
- ✅ Handle errors gracefully with user-friendly messages
- ✅ Work seamlessly with existing Supabase database schema
- ✅ Maintain data integrity and security
- ✅ Be responsive and performant
- ✅ Follow established code patterns and architecture

