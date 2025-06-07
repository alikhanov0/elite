import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { onlyRole } from '../middlewares/role.middleware'
import {
  getTeacherGroups,
  getGroupLessons,
  getLessonStudents,
  saveLessonGrades,
  createLesson
} from '../controllers/teacher.controller'

const router = Router()

router.use(authenticate)
router.use(onlyRole('teacher'))

router.get('/groups', getTeacherGroups)
router.get('/group/:groupId/lessons', getGroupLessons)
router.get('/lesson/:lessonId/students', getLessonStudents)
router.post('/lesson/:lessonId/save', saveLessonGrades)
router.post('/group/:groupId/create-lesson', createLesson)



export default router
