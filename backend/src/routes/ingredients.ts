import { Router } from "express";
import ingredientController from "../controllers/ingredients";

const router = Router();

router.get('/ingredients', ingredientController.getIngredients);
router.get('/ingredients/:id', ingredientController.getIngredientById);
router.post('/ingredients', ingredientController.createIngredient);
router.put('/ingredients/:id', ingredientController.updateIngredient);
router.delete('/ingredients/:id', ingredientController.deleteIngredient);

export default router;
