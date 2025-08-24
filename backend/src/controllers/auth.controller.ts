import { Request, Response, RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'
import { hashPassword, comparePasswords } from '../utils/hash'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export const register: RequestHandler  = async (req: Request, res: Response) => {
  const { username, password, role, name, surname, email } = req.body

  if (!username || !password || !role || !name || !surname || !email) {
    res.status(400).json({ error: 'Все поля обязательны' })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing)  res.status(409).json({ error: 'Пользователь уже существует' })

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashed,
        role,
        name,
        surname,
        email,
      }
    })

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

export const login: RequestHandler = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ error: 'Введите логин и пароль' })
    return
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) {
      res.status(401).json({ error: 'Неверный логин' })
      return
    }

    const valid = await comparePasswords(password, user.password)

    if (!valid) {
      res.status(401).json({ error: 'Неверный пароль' })
      return
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}