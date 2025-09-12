import { Request, Response } from 'express';
import { ShiftService } from '../services/shift';
import { extractUserId } from '../utils/jwtAuth';

const shiftService = new ShiftService();

export const createShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = extractUserId(req);
        const shiftData = {
            ...req.body,
            admin_id: userId
        };

        const result = await shiftService.createShift(shiftData);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in createShift controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getShifts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({
                success: false,
                error: 'Missing required parameters: startDate, endDate'
            });
            return;
        }

        const result = await shiftService.getShiftsByDateRange(
            startDate as string,
            endDate as string
        );

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in getShifts controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shiftDate } = req.params;

        if (!shiftDate) {
            res.status(400).json({
                success: false,
                error: 'Missing required parameter: shiftDate'
            });
            return;
        }

        const result = await shiftService.getShiftByDate(shiftDate);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error in getShift controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const updateShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shiftDate } = req.params;
        const updateData = req.body;

        if (!shiftDate) {
            res.status(400).json({
                success: false,
                error: 'Missing required parameter: shiftDate'
            });
            return;
        }

        const result = await shiftService.updateShift(shiftDate, updateData);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in updateShift controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const deleteShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shiftDate } = req.params;

        if (!shiftDate) {
            res.status(400).json({
                success: false,
                error: 'Missing required parameter: shiftDate'
            });
            return;
        }

        const result = await shiftService.deleteShift(shiftDate);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in deleteShift controller:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
