import { Router } from "express";

import employeeController from "../controllers/employee";

const router = Router()

router.get('/employees', employeeController.getEmployees)
router.get('/employees/:id', employeeController.getEmployeeById)
router.post('/employees', employeeController.createEmployee)
router.patch('/employees/:id', employeeController.updateEmployee)
router.delete('/employees/:id', employeeController.fireEmployee)

export default router
