import { Router } from "express";
import restaurantController from "../controllers/restaurant";

const router = Router()

router.get('/restaurants', restaurantController.getRestaurants)
export default router