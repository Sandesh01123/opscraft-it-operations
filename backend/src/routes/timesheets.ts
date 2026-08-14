import { Router } from 'express'
import {
  getTimesheets,
  submitTimesheet,
  updateTimesheet,
  getTimesheetSummary
} from '../controllers/timesheetController'

const router = Router()

router.get('/', getTimesheets)
router.get('/summary', getTimesheetSummary)
router.post('/', submitTimesheet)
router.patch('/:id', updateTimesheet)

export default router
