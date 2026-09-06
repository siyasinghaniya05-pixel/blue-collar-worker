import express from 'express';
import { getDB } from '../config/db.js';
import { matchWorkers, PROBLEM_DIAGNOSES } from '../services/matchingEngine.js';

const router = express.Router();

// List common problem diagnoses
router.get('/diagnoses', (req, res) => {
  res.json(PROBLEM_DIAGNOSES);
});

// Run smart matching
router.post('/match', (req, res) => {
  const { problemId, category, location, maxBudget, urgency } = req.body;
  const db = getDB();

  const results = matchWorkers(db.workers, {
    problemId,
    category,
    location,
    maxBudget,
    urgency
  });

  res.json(results);
});

export default router;
