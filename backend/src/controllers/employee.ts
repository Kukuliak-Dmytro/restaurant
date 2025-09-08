import { getEmployeesOperation, getEmployeeByIdOperation, createEmployeeOperation, updateEmployeeOperation, fireEmployeeOperation, getEmployeeByUserIdOperation, upsertEmployeeByUserIdOperation } from "../operations/employee";
import { getStatusFromError, formatErrorResponse, isProduction } from "../utils/errorUtils";
import type { Pagination } from "../utils/pagination";
import { paginate } from "../utils/pagination";
import { Request, Response } from "express";
import type Employee from "../types/employee";
import { extractUserId } from "../utils/jwtAuth";

const employeeController = {
    getEmployees: async (req: Request, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const employees = await getEmployeesOperation()
            const paginatedEmployees = paginate(employees, page, limit)
            
            if(paginatedEmployees.page > paginatedEmployees.total) {
                res.status(404).json({ 
                    error: 'Page not found',
                    code: 'PAGE_NOT_FOUND'
                })
                return
            }
            
            res.json(paginatedEmployees)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    getEmployeeById: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id)
            
            // Basic validation
            if (!id || isNaN(id)) {
                res.status(400).json({ 
                    error: 'Valid numeric ID is required',
                    code: 'MISSING_ID'
                });
                return;
            }

            const employee = await getEmployeeByIdOperation(id)
            
            if (!employee) {
                res.status(404).json({ 
                    error: 'Employee not found',
                    code: 'NOT_FOUND'
                });
                return;
            }

            res.json(employee)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    createEmployee: async (req: Request, res: Response): Promise<void> => {
        try {
            const employeeData = req.body;
            
            // Basic validation
            if (!employeeData || Object.keys(employeeData).length === 0) {
                res.status(400).json({ 
                    error: 'Employee data is required',
                    code: 'MISSING_DATA'
                });
                return;
            }

            const employee = await createEmployeeOperation(employeeData)
            res.status(201).json(employee)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    updateEmployee: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id)
            const employeeData = req.body;
            
            // Basic validation
            if (!id || isNaN(id)) {
                res.status(400).json({ 
                    error: 'Valid numeric ID is required for update',
                    code: 'MISSING_ID'
                });
                return;
            }

            if (!employeeData || Object.keys(employeeData).length === 0) {
                res.status(400).json({ 
                    error: 'Update data is required',
                    code: 'MISSING_DATA'
                });
                return;
            }

            const employee = await updateEmployeeOperation(id, employeeData)
            
            if (!employee) {
                res.status(404).json({ 
                    error: 'Employee not found',
                    code: 'NOT_FOUND'
                });
                return;
            }

            res.json(employee)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    fireEmployee: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id)
            
            // Basic validation
            if (!id || isNaN(id)) {
                res.status(400).json({ 
                    error: 'Valid numeric ID is required',
                    code: 'MISSING_ID'
                });
                return;
            }

            const employee = await fireEmployeeOperation(id)
            
            if (!employee) {
                res.status(404).json({ 
                    error: 'Employee not found',
                    code: 'NOT_FOUND'
                });
                return;
            }

            res.json(employee)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    getProfile: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = extractUserId(req);
            
            if (!userId) {
                res.status(401).json({ 
                    error: 'User ID not found in token',
                    code: 'MISSING_USER_ID'
                });
                return;
            }

            const employee = await getEmployeeByUserIdOperation(userId)
            
            // Return null if no employee profile exists (not an error)
            res.json(employee)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    updateProfile: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = extractUserId(req);
            const employeeData = req.body;
            
            if (!userId) {
                res.status(401).json({ 
                    error: 'User ID not found in token',
                    code: 'MISSING_USER_ID'
                });
                return;
            }

            if (!employeeData || Object.keys(employeeData).length === 0) {
                res.status(400).json({ 
                    error: 'Profile data is required',
                    code: 'MISSING_DATA'
                });
                return;
            }

            const employee = await upsertEmployeeByUserIdOperation(userId, employeeData)
            
            if (!employee) {
                res.status(500).json({ 
                    error: 'Failed to update profile',
                    code: 'UPDATE_FAILED'
                });
                return;
            }

            res.json(employee)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    }
}

export default employeeController