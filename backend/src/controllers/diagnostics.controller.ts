import { Request, Response, RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllComponents: RequestHandler = async (req, res) => {
  try {
    const components = await prisma.testComponent.findMany()
    res.json({ components })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении компонентов' })
  }
}



export const updateDiagnosticScore: RequestHandler = async (req, res) => {
  const updates = Array.isArray(req.body) ? req.body : [req.body]

  try {
    for (const { studentId, componentId, score } of updates) {
      if (!studentId || !componentId || typeof score !== 'number') {
        continue
      }

      const existing = await prisma.diagnosticTestResult.findFirst({
        where: { studentId: +studentId, componentId: +componentId },
      })

      if (existing) {
        await prisma.diagnosticTestResult.update({
          where: { id: existing.id },
          data: { score },
        })
      } else {
        await prisma.diagnosticTestResult.create({
          data: {
            studentId: +studentId,
            componentId: +componentId,
            score,
            date: new Date(),
          },
        })
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сохранения' })
  }
}



export const getStudentLessonAnalytics: RequestHandler = async (req, res) => {
  const studentId = +req.params.studentId
  try {
    const records = await prisma.studentLesson.findMany({
      where: { studentId },
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
}


export const getStudentLessonsInRange: RequestHandler = async (req, res) => {
  const { id } = req.params
  const { from, to } = req.query

  const lessons = await prisma.studentLesson.findMany({
    where: {
      studentId: +id,
      lesson: {
        date: {
          gte: new Date(from as string),
          lte: new Date(to as string)
        }
      }
    },
    include: {
      lesson: true
    },
    orderBy: {
      lesson: {
        date: 'asc'
      }
    }
  })

  res.json({ lessons })
}


export const getStudentDiagnosticScores: RequestHandler = async (req, res) => {
  const studentId = +req.params.studentId

  try {
    const results = await prisma.diagnosticTestResult.findMany({
      where: { studentId },
      include: {
        component: true
      }
    })

    const scores: Record<number, number> = {}
    results.forEach(r => {
      scores[r.componentId] = r.score
    })

    res.json({ scores })
  } catch (err) {
    console.error('❌ Ошибка при получении оценок:', err)
    res.status(500).json({ error: 'Ошибка при загрузке оценок' })
  }
}
