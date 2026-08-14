import { Router } from 'express'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projectController'

const router = Router()

router.get('/', getProjects)
router.post('/', createProject)
router.get('/:id/stats', getProjectStats)
router.patch('/:id', updateProject)
router.delete('/:id', deleteProject)

export default router
