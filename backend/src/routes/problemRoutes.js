import express from 'express';
import { 
  getProblems, 
  getProblemById, 
  runProblemCode, 
  submitProblemCode,
  getProblemHint,
  reviewProblemCode
} from '../controllers/problemController.js';

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/:id/run', runProblemCode);
router.post('/:id/submit', submitProblemCode);
router.post('/:id/hint', getProblemHint);
router.post('/:id/review', reviewProblemCode);

export default router;
