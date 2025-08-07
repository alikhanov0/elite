import { Router } from 'express'
import { getMonthlyRating, getMonthlyRatingByGrade } from '../controllers/public.controller'


const router = Router()
router.get('/rating/group/:grade', getMonthlyRatingByGrade);
router.get('/rating/all', getMonthlyRating)


export default router