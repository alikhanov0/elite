import { Request, Response, NextFunction } from 'express'

export const onlyRole = (role: 'admin' | 'teacher' | 'student') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user

    if (!user || user.role !== role) {
      res.status(403).json({ error: `Доступ только для ${role}` })
      return
    }

    next()
  }
}
