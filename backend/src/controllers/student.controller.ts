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
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки результатов' })
  }
}
