import { Router } from 'express'
import {
  getClients,
  createClient,
  getClientById,
  updateClient
} from '../controllers/clientController'

const router = Router()

router.get('/', getClients)
router.post('/', createClient)
router.get('/:id', getClientById)
router.patch('/:id', updateClient)

export default router
