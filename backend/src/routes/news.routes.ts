import { Router } from 'express'
import { createNews, getAllNews, deleteNews } from '../controllers/news.controller'

const router = Router()

router.post('/', createNews)
router.get('/', getAllNews)
router.delete('/:id', deleteNews)

export default router
