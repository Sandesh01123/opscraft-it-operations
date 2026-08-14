import { Router } from 'express'
import {
  getLeaves,
  applyLeave,
  approveLeave,
  rejectLeave,
  getLeaveBalances,
  getAllLeaveBalances
} from '../controllers/leaveController'

const router = Router()

router.get('/', getLeaves)
router.get('/balances', getAllLeaveBalances)
router.get('/balances/:employee_id', getLeaveBalances)
router.post('/', applyLeave)
router.patch('/:id/approve', approveLeave)
router.patch('/:id/reject', rejectLeave)

export default router
