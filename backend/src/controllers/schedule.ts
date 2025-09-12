import { Request, Response } from 'express';
import { ScheduleService } from '../services/schedule';
import { extractUserId } from '../utils/jwtAuth';

const scheduleService = new ScheduleService();

export const getSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { locationId, startDate, endDate } = req.query;

        if (!locationId || !startDate || !endDate) {
            res.status(400).json({
                success: false,
                error: 'Missing required parameters: locationId, startDate, endDate'
            });
            return;
        }

        const result = await scheduleService.getScheduleByDateRange(
            Number(locationId),
            startDate as string,
            endDate as string
        );

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in getSchedule controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const assignEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = extractUserId(req);
        console.log('🔐 [Controller] assignEmployee - User ID:', userId);
        
        if (!userId) {
            console.log('🔐 [Controller] assignEmployee - No user ID found');
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Check permissions
        console.log('🔐 [Controller] assignEmployee - Checking permissions for user:', userId);
        const permissionResult = await scheduleService.validateSchedulePermissions(userId);
        
        console.log('🔐 [Controller] assignEmployee - Permission result:', {
            success: permissionResult.success,
            canEdit: permissionResult.data?.canEdit,
            isAdmin: permissionResult.data?.isAdmin,
            roleId: permissionResult.data?.roleId
        });
        
        if (!permissionResult.success || !permissionResult.data?.canEdit) {
            console.log('🔐 [Controller] assignEmployee - Access denied');
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions to edit schedules'
            });
            return;
        }
        
        console.log('🔐 [Controller] assignEmployee - Access granted, proceeding with assignment');

        const { shift_date, location_id, employee_id } = req.body;

        if (!shift_date || !location_id || !employee_id) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: shift_date, location_id, employee_id'
            });
            return;
        }

        const result = await scheduleService.assignEmployeeToShift({
            shift_date,
            location_id: Number(location_id),
            employee_id
        });

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in assignEmployee controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const removeEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = extractUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        // Check permissions
        const permissionResult = await scheduleService.validateSchedulePermissions(userId);
        if (!permissionResult.success || !permissionResult.data?.canEdit) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions to edit schedules'
            });
            return;
        }

        const { employee_id, shift_date, location_id } = req.body;

        if (!employee_id || !shift_date || !location_id) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: employee_id, shift_date, location_id'
            });
            return;
        }

        const result = await scheduleService.removeEmployeeFromShift(
            employee_id,
            shift_date,
            Number(location_id)
        );

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in removeEmployee controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
        const { locationId } = req.query;

        if (!locationId) {
            res.status(400).json({
                success: false,
                error: 'Missing required parameter: locationId'
            });
            return;
        }

        const result = await scheduleService.getEmployeesByLocation(Number(locationId));

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in getEmployees controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getRoles = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await scheduleService.getRoles();

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in getRoles controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getLocations = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await scheduleService.getLocations();

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in getLocations controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = extractUserId(req);
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const result = await scheduleService.validateSchedulePermissions(userId);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in getPermissions controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
