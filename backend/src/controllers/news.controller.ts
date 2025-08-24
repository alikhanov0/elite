import { Request, Response, RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createNews: RequestHandler = async (req, res) => {
  try {
    const { title, text } = req.body

    if (!title || !text) {
      res.status(400).json({ error: 'Title and text are required' })
      return
    }

    const news = await prisma.news.create({
      data: { title, text },
    })

    res.json(news)
    return
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news' })
  }
}

export const getAllNews: RequestHandler = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(news)
    return
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' })
  }
}

export const deleteNews: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.news.delete({ where: { id } });
    res.json({ message: 'Объявление удалено' });
    return
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении' });
  }
}