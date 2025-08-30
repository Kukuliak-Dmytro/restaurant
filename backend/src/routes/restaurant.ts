import { Router } from "express";
import restaurantController from "../controllers/restaurant";

const router = Router()

router.get('/restaurants', restaurantController.getRestaurants)
router.get('/restaurants/:id', restaurantController.getRestaurantById)
router.post('/restaurants', restaurantController.createRestaurant)
router.patch('/restaurants/:id', restaurantController.updateRestaurant)
export default router