import { Router } from 'express'
import { register, login } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { onlyRole } from '../middlewares/role.middleware'
import { getTodayBirthdays } from '../controllers/notifications.controller'

const router = Router()

router.get('/test', (req, res) => {
  res.json({ message: 'Auth route works!' })
})

router.post('/register', register)
router.post('/login', login)

router.get('/admin-data', authenticate, onlyRole('admin'), (req, res) => {
  res.json({ secret: '🔒 Только для админов' })
})

router.get('/teacher-data', authenticate, onlyRole('teacher'), (req, res) => {
  res.json({ secret: '📚 Только для учителей' })
})

router.get('/student-data', authenticate, onlyRole('student'), (req, res) => {
  res.json({ secret: '🎓 Только для студентов' })
})

router.get('/me', authenticate, (req, res) => {
  const user = (req as any).user
  res.json({ message: 'Вы авторизованы!', user })
  return
})


router.get('/notifications/birthdays/today', authenticate, getTodayBirthdays);


export default router
