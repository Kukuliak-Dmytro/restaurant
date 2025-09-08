import { Router } from "express";

import employeeController from "../controllers/employee";
import { authenticateToken } from "../utils/jwtAuth";

const router = Router()

router.get('/employees', employeeController.getEmployees)
router.get('/employees/:id', employeeController.getEmployeeById)
router.post('/employees', employeeController.createEmployee)
router.patch('/employees/:id', employeeController.updateEmployee)
router.delete('/employees/:id', employeeController.fireEmployee)

// Profile routes with JWT authentication
router.get('/profile', authenticateToken, employeeController.getProfile)
router.patch('/profile', authenticateToken, employeeController.updateProfile)

export default router
