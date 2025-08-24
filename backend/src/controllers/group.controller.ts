import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllGroups = async (req: Request, res: Response) => {
  const groups = await prisma.group.findMany({
    include: {
      teacher: true,
      students: {
        include: { student: true }
      },
      lessons: true
    }
  })
  res.json({ groups })
  return
}

export const getGroupById = async (req: Request, res: Response) => {
  const groupId = +req.params.id

  if (isNaN(groupId)) {
    res.status(400).json({ error: 'Неверный ID группы' })
    return
  }

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        teacher: true,
        students: { include: { student: true } },
        lessons: true
      }
    })

    if (!group) {
      res.status(404).json({ error: 'Группа не найдена' })
      return
    }

    res.json({ group }) // ✅ НЕ возвращай res.json
    return
  } catch (err) {
    console.error('Ошибка получения группы:', err)
    res.status(500).json({ error: 'Ошибка сервера при получении группы' })
  }
}

export const updateLesson = async (req: Request, res: Response) => {
  const { lessonId } = req.params
  const { name, date } = req.body

  try {
    await prisma.lesson.update({
      where: { id: +lessonId },
      data: {
        name,
        date: new Date(date)
      }
    })
    res.json({ success: true })
    return
  } catch (err) {
    console.error('Ошибка обновления урока:', err)
    res.status(500).json({ error: 'Ошибка при обновлении урока' })
  }
}

export const changeTeacher = async (req: Request, res: Response) => {
  const groupId = parseInt(req.params.id)
  const { teacherId } = req.body

  try {
    await prisma.group.update({
      where: { id: groupId },
      data: { teacherId: +teacherId }
    })
    res.json({ success: true })
    return
  } catch (err) {
    console.error('Ошибка смены учителя:', err)
    res.status(500).json({ error: 'Ошибка при обновлении учителя' })
  }
}

export const addStudentToGroup = async (req: Request, res: Response) => {
  const groupId = +req.params.id
  const { studentId } = req.body

  try {
    await prisma.studentGroup.create({
      data: {
        groupId,
        studentId,
      },
    })
    res.json({ success: true })
    return
  } catch (error) {
    console.error('Error adding student to group:', error)
    res.status(500).json({ error: 'Ошибка при добавлении студента' })
  }
}

export const removeStudentFromGroup = async (req: Request, res: Response) => {
  const groupId = +req.params.id
  const { studentId } = req.body

  try {
    await prisma.studentGroup.deleteMany({
      where: {
        groupId,
        studentId,
      },
    })
    res.json({ success: true })
    return
  } catch (error) {
    console.error('Error removing student from group:', error)
    res.status(500).json({ error: 'Ошибка при удалении студента' })
  }
}
