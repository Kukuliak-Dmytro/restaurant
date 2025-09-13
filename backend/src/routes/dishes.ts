import { Router } from "express";
import dishController from "../controllers/dishes";

const router = Router();

router.get('/dishes', dishController.getDishes);
router.get('/dishes/:id', dishController.getDishById);
router.post('/dishes', dishController.createDish);
router.put('/dishes/:id', dishController.updateDish);
router.delete('/dishes/:id', dishController.deleteDish);
router.get('/categories', dishController.getCategories);

export default router;
