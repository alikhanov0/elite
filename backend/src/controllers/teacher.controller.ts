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
  return
}

export const getGroupLessons = async (req: Request, res: Response) => {
  const { groupId } = req.params
  const lessons = await prisma.lesson.findMany({
    where: { groupId: +groupId },
    orderBy: { date: 'asc' }
  })
  res.json({ lessons })
  return
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
  return
}


export const saveLessonGrades: RequestHandler = async (req, res) => {
  const lessonId = +req.params.lessonId;
  const grades: {
    studentId: number;
    status: 'visited' | 'absent_reasoned' | 'absent_unreasoned';
    score: number;
    homeworkScore: number;
  }[] = req.body;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { groupId: true }
    });

    if (!lesson || lesson.groupId === null) {
       res.status(404).json({ error: 'Урок или группа не найдены' });
       return
    }

    const groupId = lesson.groupId;
    const toDecrement: number[] = [];

    for (const { studentId, status, score, homeworkScore } of grades) {
      await prisma.studentLesson.upsert({
        where: { studentId_lessonId: { studentId, lessonId } },
        create: { studentId, lessonId, status, score, homeworkScore },
        update: { status, score, homeworkScore }
      });

      if (status === 'visited' || status === 'absent_unreasoned') {
        toDecrement.push(studentId);
      }
    }

    if (toDecrement.length > 0) {
      const eligible = await prisma.studentGroup.findMany({
        where: {
          studentId: { in: toDecrement },
          groupId: groupId,
          lessonsLeft: { gt: 0 }
        },
        select: { studentId: true }
      });

      const eligibleIds = eligible.map(s => s.studentId);

      if (eligibleIds.length > 0) {
        await prisma.studentGroup.updateMany({
          where: {
            studentId: { in: eligibleIds },
            groupId: groupId
          },
          data: {
            lessonsLeft: { decrement: 1 }
          }
        });
      }

      // после обновления абонемента
if (eligibleIds.length < toDecrement.length) {
  const notUpdated = toDecrement.filter(id => !eligibleIds.includes(id));

  const missingStudents = await prisma.user.findMany({
    where: { id: { in: notUpdated } },
    select: { name: true, surname: true }
  });

  const msg = `У следующих студентов недостаточно уроков: ${missingStudents
    .map(s => `${s.name} ${s.surname}`)
    .join(', ')}`;

  res.json({ success: true, warning: msg });
  return;
}


    }
    
    res.json({ success: true });
    return
  } catch (err) {
    console.error('[SAVE GRADES ERROR]', err);
    res.status(500).json({ error: 'Ошибка при сохранении оценок' });
    return
  }
};




export const createLesson: RequestHandler = async (req, res) => {
  const user = (req as any).user
  const groupId = +req.params.groupId
  const { name, date, repeat = 1 } = req.body

  if (!name || !date || !groupId) {
    res.status(400).json({ error: 'Missing fields' })
    return 
  }

  const parsedDate = new Date(date)
  const now = new Date()
  const hundredYearsFromNow = new Date()
  hundredYearsFromNow.setFullYear(now.getFullYear() + 100)

  if (
    isNaN(parsedDate.getTime()) ||
    parsedDate < new Date('2000-01-01') ||
    parsedDate > hundredYearsFromNow
  ) {
    res.status(400).json({ error: 'Некорректная дата урока' })
    return
  }

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      res.status(404).json({ error: 'Группа не найдена' })
      return 
    }

    // ⛔ Только учитель своей группы или админ может добавлять
    if (user.role === 'teacher' && group.teacherId !== user.id) {
      res.status(403).json({ error: 'Access denied to this group' })
      return
    }

    const lessons = Array.from({ length: repeat }, (_, i) => ({
      name,
      date: new Date(parsedDate.getTime() + i * 7 * 24 * 60 * 60 * 1000), // + i недель
      groupId,
      teacherId: group.teacherId
    }))

    await prisma.lesson.createMany({ data: lessons })

    res.status(201).json({ success: true, count: lessons.length })
    return 
  } catch (err) {
    console.error('[CREATE LESSON ERROR]', err)
    res.status(500).json({ error: 'Internal server error' })
    return 
  }
}

export const deleteLesson: RequestHandler = async (req, res) => {
  const { lessonId } = req.params;

  try {
    // Удаление зависимостей
    await prisma.studentLesson.deleteMany({
      where: { lessonId: +lessonId }
    });

    // Удаление самого урока
    await prisma.lesson.delete({
      where: { id: +lessonId }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[DELETE LESSON ERROR]', err);
    res.status(500).json({ error: 'Ошибка при удалении урока' });
  }
};



export const updateLessons: RequestHandler = async (req, res) => {
  const { studentId, lessonsLeft } = req.body

  try {
    await prisma.studentGroup.updateMany({
      where: {
        studentId: +studentId,
        groupId: +req.params.groupId
      },
      data: { lessonsLeft }
    })
    res.json({ success: true })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка при обновлении абонемента' })
  }
}