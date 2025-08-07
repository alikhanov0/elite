import { RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        role: true,
        email: true,
        password: true,
        birthday: true
      }
    })
    res.json({ users })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения пользователей' })
  }
}

export const updateUserRole: RequestHandler = async (req, res) => {
  const userId = +req.params.id
  const { role } = req.body

  if (!['admin', 'teacher', 'student'].includes(role)) {
    res.status(400).json({ error: 'Недопустимая роль' })
    return
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role }
  })

  res.json({ success: true })
}

export const deleteUser: RequestHandler = async (req, res) => {
  const userId = +req.params.id

  try {
    await prisma.user.delete({ where: { id: userId } })
    res.json({ success: true })
  } catch (err) {
    console.error('Ошибка при удалении:', err)
    res.status(500).json({ error: 'Ошибка при удалении пользователя' })
  }
}



export const updateBirthday: RequestHandler = async (req, res) => {
  const userId = +req.params.userId
  const { birthday } = req.body

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { birthday: new Date(birthday) },
    })
    res.json({ success: true })
  } catch (err) {
    console.error('[UPDATE BIRTHDAY ERROR]', err)
    res.status(500).json({ error: 'Ошибка при обновлении дня рождения' })
  }
}
