import { RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getTodayBirthdays: RequestHandler = async (req, res) => {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()

  const users = await prisma.user.findMany({
    where: { birthday: { not: null } }
  })

  const todayBirthdays = users.filter(user => {
    if (!user.birthday) return false
    const bday = new Date(user.birthday)
    return bday.getDate() === day && bday.getMonth() + 1 === month
  })

  res.json({
    todayBirthdays: todayBirthdays.map(u => ({
      id: u.id,
      name: u.name,
      surname: u.surname,
      role: u.role
    }))
  })
}
