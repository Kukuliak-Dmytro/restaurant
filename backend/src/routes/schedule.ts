import express from 'express';
import { authenticateToken } from '../utils/jwtAuth';
import {
    getSchedule,
    assignEmployee,
    removeEmployee,
    getEmployees,
    getRoles,
    getLocations,
    getPermissions
} from '../controllers/schedule';

const router = express.Router();

// All schedule routes require authentication
router.use(authenticateToken);

// GET /api/schedule - Get schedule data for date range
router.get('/', getSchedule);

// POST /api/schedule/assign - Assign employee to shift
router.post('/assign', assignEmployee);

// DELETE /api/schedule/remove - Remove employee from shift
router.delete('/remove', removeEmployee);

// GET /api/schedule/employees - Get employees by location
router.get('/employees', getEmployees);

// GET /api/schedule/roles - Get all roles
router.get('/roles', getRoles);

// GET /api/schedule/locations - Get all locations
router.get('/locations', getLocations);

// GET /api/schedule/permissions - Get user permissions
router.get('/permissions', getPermissions);

export default router;
