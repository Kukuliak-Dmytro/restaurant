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
            const restaurants = await getRestaurantsOperation()
            const paginatedRestaurants = paginate(restaurants, page, limit)
            if(paginatedRestaurants.page > paginatedRestaurants.total) {
                res.status(404).json({ error: 'Page not found' })
                return
            }
            res.json(paginatedRestaurants)
        } catch (error: any) {
            const statusCode = getStatusFromError(error);
            const errorResponse = formatErrorResponse(error, isProduction());
            
            res.status(statusCode).json(errorResponse);
        }
    } ,

    getRestaurantById: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id)
            if(!id || isNaN(id)) {
                res.status(400).json({ 
                    error: 'Valid numeric ID is required',
                    code: 'MISSING_ID'
                })
                return
            }

            const restaurant = await getRestaurantByIdOperation(id)

            if(!restaurant) {
                res.status(404).json({ 
                    error: 'Restaurant not found',
                    code: 'NOT_FOUND'
                })
                return
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
            const {budget, finish_construction, address} = req.body
            
            // Basic validation
            if (!address) {
                res.status(400).json({ 
                    error: 'Address is required',
                    code: 'MISSING_DATA'
                });
                return;
            }
            
            const restaurant = await createRestaurantOperation({budget, finish_construction, address})
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
            const {budget, finish_construction, start_construction, address} = req.body
            
            // Basic validation
            if (!id || isNaN(parseInt(id))) {
                res.status(400).json({ 
                    error: 'Valid numeric ID is required',
                    code: 'MISSING_ID'
                });
                return;
            }
            
            const restaurant = await updateRestaurantOperation(parseInt(id), {budget, finish_construction, start_construction, address})
            
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