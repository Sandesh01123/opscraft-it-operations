import { Router } from 'express'
import {
  getInvoices,
  createInvoice,
  markInvoicePaid,
  generateInvoiceFromTimesheets
} from '../controllers/invoiceController'

const router = Router()

router.get('/', getInvoices)
router.post('/', createInvoice)
router.post('/generate-from-timesheets', generateInvoiceFromTimesheets)
router.patch('/:id/pay', markInvoicePaid)

export default router
