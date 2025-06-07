import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { getStudentDiagnosticScores } from '../controllers/diagnostics.controller'

const router = Router()

router.get('/scores/:studentId', authenticate, getStudentDiagnosticScores)

export default router