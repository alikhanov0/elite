import { RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getMonthlyRating: RequestHandler = async (req, res) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const data = await prisma.studentLesson.findMany({
    where: {
      lesson: {
        date: {
          gte: start,
          lte: end
        }
      }
    },
    include: {
      student: true
    }
  })

  const map = new Map<number, { id: number; name: string; surname: string; totalScore: number }>()

  for (const record of data) {
    const student = record.student
    if (!map.has(student.id)) {
      map.set(student.id, {
        id: student.id,
        name: student.name,
        surname: student.surname,
        totalScore: 0
      })
    }

    const entry = map.get(student.id)!
    entry.totalScore += (record.score ?? 0) + (record.homeworkScore ?? 0)
  }

  const ratings = Array.from(map.values()).sort((a, b) => b.totalScore - a.totalScore)
  res.json({ ratings })
}
