import { Request, Response } from 'express';
import ingredientService from '../services/ingredients';

const ingredientController = {
  async getIngredients(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await ingredientService.getIngredients(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch ingredients' 
      });
    }
  },

  async getIngredientById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ingredientService.getIngredientById(parseInt(id));
      res.json(result);
    } catch (error) {
      console.error('Error fetching ingredient:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch ingredient' 
      });
    }
  },

  async createIngredient(req: Request, res: Response) {
    try {
      const ingredientData = req.body;
      const result = await ingredientService.createIngredient(ingredientData);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating ingredient:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create ingredient' 
      });
    }
  },

  async updateIngredient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await ingredientService.updateIngredient(parseInt(id), updateData);
      res.json(result);
    } catch (error) {
      console.error('Error updating ingredient:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update ingredient' 
      });
    }
  },

  async deleteIngredient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ingredientService.deleteIngredient(parseInt(id));
      res.json(result);
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete ingredient' 
      });
    }
  }
};

export default ingredientController;
