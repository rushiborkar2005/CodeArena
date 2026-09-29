import express from 'express';
import { 
  getProblems, 
  getProblemById, 
  runProblemCode, 
  submitProblemCode 
} from '../controllers/problemController.js';

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/:id/run', runProblemCode);
router.post('/:id/submit', submitProblemCode);

export default router;
