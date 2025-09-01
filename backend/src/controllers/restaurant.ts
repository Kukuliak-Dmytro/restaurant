import { getRestaurantsOperation, getRestaurantByIdOperation, createRestaurantOperation, updateRestaurantOperation } from "../operations/restaurant";
import { Request, Response } from "express";
import type { Pagination } from "../utils/pagination";
import { paginate } from "../utils/pagination";
import type Restaurant from "../types/restaurant";
import { getStatusFromError, formatErrorResponse, isProduction } from "../utils/errorUtils";

const restaurantController = {
    getRestaurants: async (req: Request, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            
            // Validate pagination parameters
            if (page < 1 || limit < 1) {
                res.status(400).json({ 
                    error: 'Page and limit must be positive numbers',
                    code: 'INVALID_PAGINATION'
                });
                return;
            }
            
            const restaurants = await getRestaurantsOperation()
            const paginatedRestaurants = paginate(restaurants, page, limit)
            
            if(paginatedRestaurants.page > paginatedRestaurants.total) {
                res.status(404).json({ 
                    error: 'Page not found',
                    code: 'PAGE_NOT_FOUND'
                });
                return;
            }
            
            res.json(paginatedRestaurants)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    getRestaurantById: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id)
            
            // Basic validation
            if(!id || isNaN(id)) {
                res.status(400).json({ 
                    error: 'Valid numeric ID is required',
                    code: 'MISSING_ID'
                });
                return;
            }

            const restaurant = await getRestaurantByIdOperation(id)

            if(!restaurant) {
                res.status(404).json({ 
                    error: 'Restaurant not found',
                    code: 'NOT_FOUND'
                });
                return;
            }

            res.json(restaurant)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    createRestaurant: async (req: Request, res: Response): Promise<void> => {
        try {
            const {budget, finish_construction, address, employee_count, start_construction} = req.body
            
            // Enhanced validation
            if (!address || address.trim() === '') {
                res.status(400).json({ 
                    error: 'Address is required and cannot be empty',
                    code: 'MISSING_DATA'
                });
                return;
            }
            
            // Validate budget if provided
            if (budget !== undefined && (isNaN(budget) || budget < 0)) {
                res.status(400).json({ 
                    error: 'Budget must be a positive number',
                    code: 'INVALID_DATA'
                });
                return;
            }
            
            // Validate employee count if provided
            if (employee_count !== undefined && (isNaN(employee_count) || employee_count < 0)) {
                res.status(400).json({ 
                    error: 'Employee count must be a positive number',
                    code: 'INVALID_DATA'
                });
                return;
            }
            
            const restaurant = await createRestaurantOperation({budget, finish_construction, address, employee_count, start_construction})
            res.status(201).json(restaurant)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    },

    updateRestaurant: async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params
            const {budget, finish_construction, start_construction, address, employee_count} = req.body
            
            // Enhanced validation
            if (!id || isNaN(parseInt(id))) {
                res.status(400).json({ 
                    error: 'Valid numeric ID is required',
                    code: 'MISSING_ID'
                });
                return;
            }
            
            // Validate that at least one field is provided for update
            if (!budget && !finish_construction && !start_construction && !address && employee_count === undefined) {
                res.status(400).json({ 
                    error: 'At least one field must be provided for update',
                    code: 'MISSING_DATA'
                });
                return;
            }
            
            // Validate budget if provided
            if (budget !== undefined && (isNaN(budget) || budget < 0)) {
                res.status(400).json({ 
                    error: 'Budget must be a positive number',
                    code: 'INVALID_DATA'
                });
                return;
            }
            
            // Validate employee count if provided
            if (employee_count !== undefined && (isNaN(employee_count) || employee_count < 0)) {
                res.status(400).json({ 
                    error: 'Employee count must be a positive number',
                    code: 'INVALID_DATA'
                });
                return;
            }
            
            const restaurant = await updateRestaurantOperation(parseInt(id), {budget, finish_construction, start_construction, address, employee_count})
            
            if (!restaurant) {
                res.status(404).json({ 
                    error: 'Restaurant not found',
                    code: 'NOT_FOUND'
                });
                return;
            }
            
            res.json(restaurant)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    }
}

export default restaurantController