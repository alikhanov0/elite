import { RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getRadarData: RequestHandler = async (req, res) => {
  const user = (req as any).user

  try {
    const results = await prisma.diagnosticTestResult.findMany({
      where: { studentId: user.id },
      include: { component: true }
    })

    const grouped: { [key: string]: number[] } = {}

    results.forEach((r) => {
      const name = r.component.name
      if (!grouped[name]) {
        grouped[name] = []
      }
      grouped[name].push(r.score)
    })

    const radarData = Object.entries(grouped).map(([name, scores]) => {
      const average = scores.reduce((sum, val) => sum + val, 0) / scores.length
      return { name, score: parseFloat(average.toFixed(2)) }
    })

    res.json({ radarData })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка построения паутины' })
  }
}


export const getLessonAnalytics: RequestHandler = async (req, res) => {
  try {
    const studentId = parseInt(req.query.studentId as string)
    const from = req.query.from ? new Date(req.query.from as string) : new Date('2000-01-01')
    const to = req.query.to ? new Date(req.query.to as string) : new Date()

    if (isNaN(studentId)) {
      res.status(400).json({ error: 'Invalid studentId' })
      return
    }

    const lessons = await prisma.studentLesson.findMany({
      where: {
        studentId,
        lesson: {
          date: {
            gte: from,
            lte: to,
          },
        },
      },
      include: {
        lesson: {
          select: {
            date: true,
          },
        },
      },
      orderBy: {
        lesson: {
          date: 'asc',
        },
      },
    })

    const formatted = lessons.map((l) => ({
      date: l.lesson.date,
      score: l.score,
      homeworkScore: l.homeworkScore,
      status: l.status
    }))

    res.json({ lessons: formatted })
  } catch (err) {
    console.error('❌ Lesson analytics error:', err)
    res.status(500).json({ error: 'Server error while fetching lesson analytics' })
  }
}