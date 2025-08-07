import { Router } from 'express'
import { getStudentDiagnostics, getStudentMonthlyAverages } from '../controllers/student.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.get('/diagnostics/:id', authenticate, getStudentDiagnostics)
router.get('/:id/average-scores', authenticate, getStudentMonthlyAverages);

export default router