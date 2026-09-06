import express from 'express';
import { getDB, getWorkerById, updateWorker, recalculateWorkerScore, persistDatabase } from '../config/db.js';

const router = express.Router();

// Get list of available assessments
router.get('/', (req, res) => {
  const db = getDB();
  const { category } = req.query;

  let list = db.assessments;
  if (category) {
    list = list.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  // Return assessment summaries without revealing answers
  const summaries = list.map(a => ({
    id: a.id,
    category: a.category,
    title: a.title,
    description: a.description,
    durationMinutes: a.durationMinutes,
    passScore: a.passScore,
    totalQuestions: a.sections.reduce((acc, s) => acc + s.questions.length, 0)
  }));

  res.json(summaries);
});

// Get full assessment with questions
router.get('/:id', (req, res) => {
  const db = getDB();
  const assessment = db.assessments.find(a => a.id === req.params.id);

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  // Send questions without correctAnswer field so client cannot cheat
  const sanitized = {
    ...assessment,
    sections: assessment.sections.map(section => ({
      ...section,
      questions: section.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        skillArea: q.skillArea
      }))
    }))
  };

  res.json(sanitized);
});

// Submit assessment answers
router.post('/submit', (req, res) => {
  const { assessmentId, workerId = 'w-1', answers = {} } = req.body;
  const db = getDB();

  const assessment = db.assessments.find(a => a.id === assessmentId);
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  const worker = getWorkerById(workerId);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }

  // Flatten all questions
  const allQuestions = [];
  assessment.sections.forEach(s => {
    s.questions.forEach(q => allQuestions.push(q));
  });

  let correctCount = 0;
  const areaResults = {};
  const questionFeedback = [];

  allQuestions.forEach(q => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer !== undefined && Number(userAnswer) === q.correctAnswer;
    if (isCorrect) correctCount++;

    if (!areaResults[q.skillArea]) {
      areaResults[q.skillArea] = { total: 0, correct: 0 };
    }
    areaResults[q.skillArea].total += 1;
    if (isCorrect) areaResults[q.skillArea].correct += 1;

    questionFeedback.push({
      questionId: q.id,
      question: q.question,
      userAnswer: userAnswer !== undefined ? q.options[userAnswer] : 'Not answered',
      correctAnswer: q.options[q.correctAnswer],
      isCorrect,
      explanation: q.explanation,
      skillArea: q.skillArea
    });
  });

  const percentage = Math.round((correctCount / allQuestions.length) * 100);
  const passed = percentage >= assessment.passScore;

  // Previous status
  const prevScore = worker.skillScore;
  const prevLevel = worker.level;

  // Update worker's practical test score
  worker.verifications.practicalTestScore = Math.max(worker.verifications.practicalTestScore || 0, percentage);
  worker.verifications.practicalTestPassed = passed;

  // Update skill breakdown scores based on assessment performance
  const updatedBreakdown = worker.skillBreakdown.map(item => {
    const area = areaResults[item.name];
    if (area && area.total > 0) {
      const areaPct = Math.round((area.correct / area.total) * 100);
      return {
        ...item,
        score: Math.min(99, Math.round((item.score * 0.5) + (areaPct * 0.5)))
      };
    }
    return item;
  });
  worker.skillBreakdown = updatedBreakdown;

  // Recalculate transparent Skill Score & Level
  const updatedWorker = recalculateWorkerScore(worker.id);

  persistDatabase();

  res.json({
    assessmentId,
    title: assessment.title,
    category: assessment.category,
    score: percentage,
    passed,
    passScore: assessment.passScore,
    correctCount,
    totalQuestions: allQuestions.length,
    newSkillScore: updatedWorker.skillScore,
    previousSkillScore: prevScore,
    newLevel: updatedWorker.level,
    newTierName: updatedWorker.tierName,
    newBadge: updatedWorker.badge,
    leveledUp: updatedWorker.level > prevLevel,
    questionFeedback,
    cooldownHours: 24
  });
});

export default router;
