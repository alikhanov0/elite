import { Request, Response, RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '../types/express/custom'

const prisma = new PrismaClient()


export const getTeacherGroups: RequestHandler = async (req, res) => {
  const typedReq = req as AuthenticatedRequest
  const teacherId = typedReq.user.id

  const groups = await prisma.group.findMany({
    where: { teacherId },
    select: { id: true, name: true }
  })

  res.json({ groups })
}

export const getGroupLessons = async (req: Request, res: Response) => {
  const { groupId } = req.params
  const lessons = await prisma.lesson.findMany({
    where: { groupId: +groupId },
    orderBy: { date: 'asc' }
  })
  res.json({ lessons })
}

export const getLessonStudents = async (req: Request, res: Response) => {
  const lessonId = +req.params.lessonId

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      group: {
        include: {
          students: { include: { student: true } }
        }
      }
    }
  })

  if (!lesson || !lesson.group) {
    res.status(404).json({ error: 'Урок или группа не найдены' })
    return
  }

  const studentLessonData = await prisma.studentLesson.findMany({
    where: { lessonId },
  })

  const result = lesson.group.students.map(s => {
    const record = studentLessonData.find(r => r.studentId === s.studentId)
    return {
      id: s.studentId,
      name: s.student.name,
      surname: s.student.surname,
      status: record?.status || 'absent_unreasoned',
      score: record?.score || 0,
      homeworkScore: record?.homeworkScore || 0
    }
  })

  res.json({ students: result })
}


export const saveLessonGrades = async (req: Request, res: Response) => {
  const lessonId = +req.params.lessonId
  const grades = req.body // array of { studentId, status, score, homeworkScore }

  for (const entry of grades) {
    const existing = await prisma.studentLesson.findFirst({
      where: { studentId: entry.studentId, lessonId }
    })

    if (existing) {
      await prisma.studentLesson.update({
        where: { id: existing.id },
        data: {
          status: entry.status,
          score: entry.score,
          homeworkScore: entry.homeworkScore
        }
      })
    } else {
      await prisma.studentLesson.create({
        data: {
          studentId: entry.studentId,
          lessonId,
          status: entry.status,
          score: entry.score,
          homeworkScore: entry.homeworkScore
        }
      })
    }
  }

  res.json({ success: true })
}

export const createLesson: RequestHandler = async (req, res) => {
  const user = (req as any).user
  const groupId = +req.params.groupId
  const { name, date } = req.body

  if (!name || !date || !groupId) {
    res.status(400).json({ error: 'Missing fields' })
    return
  }

  const parsedDate = new Date(date)
  const now = new Date()
  const hundredYearsFromNow = new Date()
  hundredYearsFromNow.setFullYear(now.getFullYear() + 100)

  if (isNaN(parsedDate.getTime()) || parsedDate < new Date('2000-01-01') || parsedDate > hundredYearsFromNow) {
    res.status(400).json({ error: 'Некорректная дата урока' })
    return
  }

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })

    if (!group || group.teacherId !== user.id) {
      res.status(403).json({ error: 'Access denied to this group' })
      return
    }

    await prisma.lesson.create({
      data: {
        name,
        date: parsedDate,
        groupId,
        teacherId: user.id
      }
    })

    res.status(201).json({ success: true })
  } catch (err) {
    console.error('[CREATE LESSON ERROR]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
