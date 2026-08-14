import { Router } from 'express'
import {
  getPayroll,
  processPayroll,
  processOneEmployee,
  finalizePayroll,
  getPayslip
} from '../controllers/payrollController'

const router = Router()

router.get('/', getPayroll)
router.post('/process', processPayroll)
router.post('/process-one', processOneEmployee)
router.patch('/finalize', finalizePayroll)
router.get('/payslip/:employee_id', getPayslip)

export default router
