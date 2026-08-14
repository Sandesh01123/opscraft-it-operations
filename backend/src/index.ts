import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

import projectRoutes from './routes/projects'
import taskRoutes from './routes/tasks'
import timesheetRoutes from './routes/timesheets'
import clientRoutes from './routes/clients'
import invoiceRoutes from './routes/invoices'
import employeeRoutes from './routes/employees'
import leaveRoutes from './routes/leaves'
import payrollRoutes from './routes/payroll'

dotenv.config()

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const missing = required.filter(k => !process.env[k])
if (missing.length) {
  console.error('Missing env vars:', missing)
  process.exit(1)
}

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }))

app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/timesheets', timesheetRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/leaves', leaveRoutes)
app.use('/api/payroll', payrollRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`IT Ops Backend running on port ${PORT}`))

export default app
