import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getStudentDiagnostics = async (req: Request, res: Response) => {
  const studentId = +req.params.id
  try {
    const results = await prisma.diagnosticTestResult.findMany({
      where: { studentId: studentId },
    })

    res.json({ results })
    return
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки результатов' })
  }
}

export const getStudentMonthlyAverages = async (req: Request, res: Response) => {
  const studentId = +req.params.id;

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);

  const lastMonthStart = new Date(thisMonthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  try {
    const thisAvg = await prisma.studentLesson.aggregate({
      where: {
        studentId,
        lesson: { date: { gte: thisMonthStart } },
      },
      _avg: { score: true },
    });

    const lastAvg = await prisma.studentLesson.aggregate({
      where: {
        studentId,
        lesson: { date: { lt: thisMonthStart, gte: lastMonthStart } },
      },
      _avg: { score: true },
    });

    res.json({
      thisMonthAvg: thisAvg._avg.score ?? 0,
      lastMonthAvg: lastAvg._avg.score ?? 0,
    });
    return
  } catch (error) {
    console.error('[GET STUDENT MONTHLY AVERAGES ERROR]', error);
    res.status(500).json({ error: 'Ошибка при получении средней оценки' });
  }
};