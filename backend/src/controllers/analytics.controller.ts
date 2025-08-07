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

    const studentGroup = await prisma.studentGroup.findFirst({
      where: { studentId },
      select: { groupId: true }
    })
    if (!studentGroup) {
      res.status(404).json({ error: 'Группа студента не найдена' });
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

    res.json({ lessons: formatted, groupId: studentGroup.groupId })
  } catch (err) {
    console.error('❌ Lesson analytics error:', err)
    res.status(500).json({ error: 'Server error while fetching lesson analytics' })
  }
}
export const getGroupAvgByDate: RequestHandler = async (req, res, next) => {
  try {
    const groupId = Number(req.query.groupId);
    const fromStr = req.query.from as string;
    const toStr = req.query.to as string;

    if (isNaN(groupId) || !fromStr || !toStr) {
      res.status(400).json({ error: 'groupId, from и to обязательны' });
      return
    }

    const from = new Date(fromStr);
    const to = new Date(toStr);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      res.status(400).json({ error: 'Неверный формат даты' });
      return
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        groupId,
        date: { gte: from, lte: to }
      },
      include: {
        studentLessons: true
      }
    });

    const map = new Map<string, number[]>();

    lessons.forEach(lesson => {
      const dateKey = lesson.date.toISOString().slice(0, 10);
      lesson.studentLessons.forEach(sl => {
        if (typeof sl.score === 'number') {
          const scores = map.get(dateKey) || [];
          scores.push(sl.score);
          map.set(dateKey, scores);
        }
      });
    });

    const data = Array.from(map.entries()).map(([day, scores]) => ({
      date: day,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ groupAvgByDate: data });
  } catch (err) {
    next(err);
  }
};
