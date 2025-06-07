import { RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createLesson: RequestHandler = async (req, res) => {
  const { name, description, date } = req.body
  const user = (req as any).user

  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'Только учителя могут создавать уроки' })
    return
  }

  try {
    const lesson = await prisma.lesson.create({
      data: {
        name,
        date: new Date(date),
        teacherId: user.id
      }
    })

    res.status(201).json({ lesson })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

export const getAllLessons: RequestHandler = async (_req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: { studentLessons: true }
    })
    res.json({ lessons })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения уроков' })
  }
}

export const gradeStudentLesson: RequestHandler = async (req, res) => {
  const user = (req as any).user
  const { lessonId } = req.params
  const { studentId, score, homeworkScore, status, comment } = req.body

  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'Только учитель может выставлять оценки' })
    return
  }

  if (!['visited', 'absent_reasoned', 'absent_unreasoned'].includes(status)) {
    res.status(400).json({ error: 'Недопустимый статус посещения' })
    return
  }

  try {
    // Если уже есть — обновим
    const existing = await prisma.studentLesson.findFirst({
      where: {
        studentId: +studentId,
        lessonId: +lessonId
      }
    })

    if (existing) {
      const updated = await prisma.studentLesson.update({
        where: { id: existing.id },
        data: {
          score,
          homeworkScore,
          status,
          comment
        }
      })
      res.json({ message: 'Оценка обновлена', data: updated })
    } else {
      const created = await prisma.studentLesson.create({
        data: {
          studentId: +studentId,
          lessonId: +lessonId,
          score,
          homeworkScore,
          status,
          comment
        }
      })
      res.status(201).json({ message: 'Оценка сохранена', data: created })
    }

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сохранения оценки' })
  }
}

