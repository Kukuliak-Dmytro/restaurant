import { Request, Response } from 'express';
import dishService from '../services/dishes';

const dishController = {
  async getDishes(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await dishService.getDishes(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch dishes' 
      });
    }
  },

  async getDishById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await dishService.getDishById(parseInt(id));
      res.json(result);
    } catch (error) {
      console.error('Error fetching dish:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch dish' 
      });
    }
  },

  async createDish(req: Request, res: Response) {
    try {
      const dishData = req.body;
      const result = await dishService.createDish(dishData);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating dish:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create dish' 
      });
    }
  },

  async updateDish(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await dishService.updateDish(parseInt(id), updateData);
      res.json(result);
    } catch (error) {
      console.error('Error updating dish:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update dish' 
      });
    }
  },

  async deleteDish(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await dishService.deleteDish(parseInt(id));
      res.json(result);
    } catch (error) {
      console.error('Error deleting dish:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete dish' 
      });
    }
  },

  async getCategories(req: Request, res: Response) {
    try {
      const result = await dishService.getCategories();
      res.json(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch categories' 
      });
    }
  }
};

export default dishController;
