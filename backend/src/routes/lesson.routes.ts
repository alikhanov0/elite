import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { onlyRole } from '../middlewares/role.middleware'
import { createLesson, getAllLessons, gradeStudentLesson  } from '../controllers/lesson.controller'


const router = Router()

router.post('/create', authenticate, onlyRole('teacher'), createLesson)
router.get('/all', authenticate, getAllLessons)
router.post('/:lessonId/grade', authenticate, onlyRole('teacher'), gradeStudentLesson)

export default router
