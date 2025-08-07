import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import lessonRoutes from './routes/lesson.routes'
import analyticsRoutes from './routes/analytics.routes'
import adminRoutes from './routes/admin.routes'
import studentRoutes from './routes/student.routes'
import diagnosticRoutes from './routes/diagnostics.routes'
import teacherRouter from './routes/teacher.routes'
import rating from './routes/public.routes'


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/diagnostics', diagnosticRoutes)
app.use('/api/teacher', teacherRouter)
app.use('/api', rating)


app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`)
})

app.get('/', (req, res) => {
  res.send('🎓 Edu-Platform API running')
})
