import { getRestaurantsOperation } from "../operations/restaurant";
import { Request, Response } from "express";
import type { Pagination } from "../utils/pagination";
import { paginate } from "../utils/pagination";
import type Restaurant from "../types/restaurant";
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
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' })
        }
    }   
}

export default restaurantController