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

export const getMonthlyRatingByGrade: RequestHandler = async (req, res) => {
  const grade = req.params.grade // например: "3"
  
  if (!grade || !/^\d+$/.test(grade)) {
    res.status(400).json({ error: 'Grade must be provided as a number in the URL, e.g. /rating/group/3' })
    return
  }

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  try {
    const data = await prisma.studentLesson.findMany({
      where: {
        lesson: {
          date: {
            gte: start,
            lte: end
          },
          group: {
            name: {
              startsWith: grade // Например, "3" → "3A", "3B"
            }
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

    res.json({ grade, ratings })
  } catch (error) {
    console.error('Ошибка при получении рейтинга:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}