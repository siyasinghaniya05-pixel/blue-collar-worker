import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/common/SkillBadge';
import confetti from 'canvas-confetti';

export default function SkillAssessmentPage() {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('id') || 'test-electrician';
  const navigate = useNavigate();
  const { user, workerProfile, refreshWorkerProfile } = useAuth();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins in seconds

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch assessment questions
  useEffect(() => {
    async function loadAssessment() {
      setLoading(true);
      try {
        const res = await fetch(`/api/assessments/${testId}`);
        if (res.ok) {
          const data = await res.json();
          setAssessment(data);
          setTimeLeft(data.durationMinutes * 60);
        }
      } catch (err) {
        console.error('Failed to load assessment', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (result || !assessment) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result, assessment]);

  const questions = assessment?.sections?.flatMap(s => s.questions) || [];
  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (questionId, optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIdx
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: testId,
          workerId: workerProfile?.id || 'w-1',
          answers: selectedAnswers
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (data.leveledUp) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 }
          });
        }
        await refreshWorkerProfile(workerProfile?.id || 'w-1');
      }
    } catch (err) {
      console.error('Error submitting assessment', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Preparing practical scenario evaluation module...</p>
      </div>
    );
  }

  // Format time mm:ss
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Assessment Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
            National Skill Verification Benchmark • {assessment.category}
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
            {assessment.title}
          </h1>
        </div>

        {!result && (
          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Time Remaining</span>
              <span className="font-mono font-bold text-base text-white">{formattedTime}</span>
            </div>
          </div>
        )}
      </div>

      {/* RESULT SCREEN */}
      {result ? (
        <div className="space-y-6">
          <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 text-center ${
            result.passed
              ? 'bg-gradient-to-b from-emerald-950/50 to-slate-900 border-emerald-500/50 shadow-glow-green'
              : 'bg-gradient-to-b from-red-950/40 to-slate-900 border-red-500/40'
          }`}>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl bg-slate-950 border border-slate-700">
              {result.passed ? '🎉' : '⚠️'}
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                Official Assessment Outcome
              </span>
              <h2 className="font-display font-extrabold text-3xl text-white">
                Score: {result.score}% — {result.passed ? 'PASSED' : 'REQUIRES RETEST'}
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {result.passed
                  ? 'Congratulations! Your practical benchmarks have been recorded in the National Skill Registry.'
                  : 'You did not meet the 65% pass benchmark. You may retake after reviewing technical procedures.'}
              </p>
            </div>

            {/* Level Elevation Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Assessment Score</span>
                <span className="text-2xl font-black font-display text-white">{result.score}%</span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Updated Skill Score</span>
                <span className="text-2xl font-black font-display text-amber-400">{result.newSkillScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Tier</span>
                <div className="mt-1">
                  <SkillBadge level={result.newLevel} size="sm" />
                </div>
              </div>
            </div>

            {result.leveledUp && (
              <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 max-w-md mx-auto">
                ⭐ TIER ELEVATION UNLOCKED: You have advanced to Level {result.newLevel} ({result.newTierName})! Your fair pricing threshold has increased.
              </div>
            )}

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={() => navigate('/worker-dashboard')}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow"
              >
                Go to Worker Dashboard
              </button>
            </div>
          </div>

          {/* Question Breakdown with Technical Explanations */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white border-b border-slate-800 pb-3">
              Technical Question Diagnostic Review
            </h3>

            <div className="space-y-4">
              {result.questionFeedback?.map((fb, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Question {idx + 1} ({fb.skillArea})</span>
                    {fb.isCorrect ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200 font-medium">{fb.question}</p>
                  <div className="text-slate-400 pt-1">
                    Correct Answer: <span className="text-emerald-300 font-semibold">{fb.correctAnswer}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 text-slate-300 italic border border-slate-800">
                    <span className="text-amber-400 font-bold not-italic">Engineering Principle: </span>
                    {fb.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* QUESTION RUNNER */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="text-amber-400 font-semibold">{currentQ?.skillArea}</span>
            </div>
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Diagnostic Scenario
            </span>
            <h2 className="font-bold text-base sm:text-lg text-white leading-relaxed">
              {currentQ?.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ?.options?.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-glow'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{option}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ml-3 ${
                    isSelected ? 'border-amber-400 bg-amber-500 text-slate-950' : 'border-slate-700'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Scoring Assessment...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
