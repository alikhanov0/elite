import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { onlyRole } from '../middlewares/role.middleware'
import { getAllUsers, updateUserRole,  deleteUser } from '../controllers/admin.controller'
import { getAllComponents, updateDiagnosticScore, getStudentLessonAnalytics, getStudentLessonsInRange } from '../controllers/diagnostics.controller'
import { PrismaClient } from '@prisma/client'
import {  getAllGroups,  getGroupById,  updateLesson,  changeTeacher,  addStudentToGroup,  removeStudentFromGroup } from '../controllers/group.controller'


const prisma = new PrismaClient()
const router = Router()

router.use(authenticate)

router.get('/users', authenticate, onlyRole('admin'), getAllUsers)
router.put('/users/:id/role', authenticate, onlyRole('admin'), updateUserRole)
router.delete('/users/:id', authenticate, onlyRole('admin'), deleteUser)
router.get('/components', getAllComponents)
router.post('/diagnostics/update', updateDiagnosticScore)
router.get('/analytics/lessons/:studentId', authenticate, onlyRole('admin'), getStudentLessonAnalytics)
router.get('/student-lessons/:id', authenticate, onlyRole('admin'), getStudentLessonsInRange)


router.get('/groups', authenticate, onlyRole('admin'), getAllGroups)
router.get('/groups/:id', authenticate, onlyRole('admin'), getGroupById)
router.put('/groups/:groupId/lessons/:lessonId', authenticate, onlyRole('admin'), updateLesson)
router.post('/groups/:id/change-teacher', authenticate, onlyRole('admin'), changeTeacher)
router.post('/groups/:id/add-student', authenticate, onlyRole('admin'), addStudentToGroup)
router.post('/groups/:id/remove-student', authenticate, onlyRole('admin'), removeStudentFromGroup)


export default router
