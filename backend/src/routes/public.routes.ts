import { Router } from 'express'
import { getMonthlyRating } from '../controllers/public.controller'

const router = Router()
router.get('/rating', getMonthlyRating)

export default router