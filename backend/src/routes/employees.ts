import { Router } from 'express'
import {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  getEmployeeDashboard
} from '../controllers/employeeController'

const router = Router()

router.get('/', getEmployees)
router.post('/', createEmployee)
router.get('/:id', getEmployeeById)
router.get('/:id/dashboard', getEmployeeDashboard)
router.patch('/:id', updateEmployee)

export default router
