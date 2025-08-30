import { Router } from "express";
import roleController from "../controllers/role";

const router = Router()

router.get('/roles', roleController.getRoles)
router.get('/roles/:id', roleController.getRoleById)
router.post('/roles', roleController.createRole)
router.patch('/roles/:id', roleController.updateRole)
router.delete('/roles/:id', roleController.deleteRole)

export default router