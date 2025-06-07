import { Router } from 'express'
import { getStudentDiagnostics } from '../controllers/student.controller'

const router = Router()

router.get('/diagnostics/:id', getStudentDiagnostics)

export default router
