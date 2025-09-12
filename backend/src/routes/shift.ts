import { Router } from 'express';
import { 
    createShift, 
    getShifts, 
    getShift, 
    updateShift, 
    deleteShift 
} from '../controllers/shift';
import { authenticateToken } from '../utils/jwtAuth';

const router = Router();

router.post('/', authenticateToken, createShift);
router.get('/', authenticateToken, getShifts);
router.get('/:shiftDate', authenticateToken, getShift);
router.put('/:shiftDate', authenticateToken, updateShift);
router.delete('/:shiftDate', authenticateToken, deleteShift);

export default router;
