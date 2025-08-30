import { Request, Response } from "express";
import { getRolesOperation, getRoleByIdOperation, createRoleOperation, updateRoleOperation, deleteRoleOperation } from "../operations/role";
import { getStatusFromError, formatErrorResponse, isProduction } from "../utils/errorUtils";

const roleController = {
    getRoles: async (req: Request, res: Response): Promise<void> => {
        try {
            const roles = await getRolesOperation()
            res.json(roles)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    getRoleById: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id
            
            // Basic validation
            if (!id || id.trim() === '') {
                res.status(400).json({ 
                    error: 'Role ID is required',
                    code: 'MISSING_ID'
                });
                return;
            }

            const role = await getRoleByIdOperation(id)
            
            if (!role) {
                res.status(404).json({ 
                    error: 'Role not found',
                    code: 'NOT_FOUND'
                });
                return;
            }

            res.json(role)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    createRole: async (req: Request, res: Response): Promise<void> => {
        try {
            const roleData = req.body;
            
            // Basic validation
            if (!roleData || Object.keys(roleData).length === 0) {
                res.status(400).json({ 
                    error: 'Role data is required',
                    code: 'MISSING_DATA'
                });
                return;
            }

            const role = await createRoleOperation(roleData)
            res.status(201).json(role)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    updateRole: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id
            const roleData = req.body;
            
            // Basic validation
            if (!id || id.trim() === '') {
                res.status(400).json({ 
                    error: 'Role ID is required for update',
                    code: 'MISSING_ID'
                });
                return;
            }

            if (!roleData || Object.keys(roleData).length === 0) {
                res.status(400).json({ 
                    error: 'Update data is required',
                    code: 'MISSING_DATA'
                });
                return;
            }

            const role = await updateRoleOperation(id, roleData)
            
            if (!role) {
                res.status(404).json({ 
                    error: 'Role not found',
                    code: 'NOT_FOUND'
                });
                return;
            }

            res.json(role)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    deleteRole: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id
            
            // Basic validation
            if (!id || id.trim() === '') {
                res.status(400).json({ 
                    error: 'Role ID is required for deletion',
                    code: 'MISSING_ID'
                });
                return;
            }

            const deletedRole = await deleteRoleOperation(id)
            
            if (!deletedRole) {
                res.status(404).json({ 
                    error: 'Role not found',
                    code: 'NOT_FOUND'
                });
                return;
            }

            res.status(204).send() // No content for successful deletion
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    }
}

export default roleController