import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Нет токена. Доступ запрещён.' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)

    // 👇 безопасно присваиваем payload токена
    ;(req as any).user = decoded

    next()
  } catch (err) {
    console.error('Ошибка валидации токена:', err)
    res.status(403).json({ error: 'Неверный токен.' })
  }
}
