import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { getRadarData, getLessonAnalytics, getGroupAvgByDate } from '../controllers/analytics.controller'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

router.get('/radar', authenticate, getRadarData)
router.get('/lesson', authenticate, getLessonAnalytics)
router.get('/my-lessons', authenticate, async (req, res) => {
  const userId = (req as any).user.id

  try {
    const records = await prisma.studentLesson.findMany({
      where: { studentId: userId },
      include: { lesson: true },
      orderBy: { lesson: { date: 'asc' } }
    })

    const attendance = { visited: 0, absent_reasoned: 0, absent_unreasoned: 0 }
    const scores = records.map(r => ({
      date: r.lesson.date,
      score: r.score,
      homework: r.homeworkScore,
    }))

    records.forEach(r => {
      attendance[r.status]++
    })

    res.json({ attendance, scores })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка при получении аналитики' })
  }
})

router.get('/group-avg', authenticate, getGroupAvgByDate);


export default router
