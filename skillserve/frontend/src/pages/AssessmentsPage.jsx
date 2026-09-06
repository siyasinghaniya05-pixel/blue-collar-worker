import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Clock, AlertCircle, CheckCircle2, Play } from 'lucide-react';
import api from '../utils/api';
import SkillBadge from '../components/common/SkillBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [workerId, setWorkerId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [activeTest, setActiveTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workerIdRaw = user?.workerProfile?.id;
        setWorkerId(workerIdRaw || null);

        const [catsRes, histRes] = await Promise.all([
          api.get('/assessments/categories').catch(() => ({ data: { categories: [] } })),
          workerIdRaw
            ? api.get(`/assessments/worker/${workerIdRaw}`).catch(() => ({ data: { assessments: [] } }))
            : Promise.resolve({ data: { assessments: [] } }),
        ]);
        setCategories(catsRes.data.categories || []);
        setHistory(histRes.data.assessments || []);
      } catch (err) {
        console.error('Failed to fetch assessments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const startTest = async (category) => {
    setStarting(true);
    try {
      const res = await api.post('/assessments/start', { serviceCategory: category });
      setActiveTest(res.data.assessment || { id: res.data.id, questions: [] });
      setCurrentQuestion(0);
      setAnswers({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start assessment');
    } finally {
      setStarting(false);
    }
  };

  const handleAnswer = (questionIndex, optionText) => {
    setAnswers({ ...answers, [questionIndex]: optionText });
  };

  const submitTest = async () => {
    if (!activeTest) return;
    setSubmitting(true);
    try {
      const answerArray = Object.keys(answers).map((idx) => ({
        questionIndex: parseInt(idx, 10),
        answer: answers[idx],
      }));
      const res = await api.post(`/assessments/${activeTest.id}/submit`, {
        answers: answerArray,
        timeSpent: Math.round((activeTest.attemptedAt ? (Date.now() - new Date(activeTest.attemptedAt).getTime()) / 1000 : 0) || 0),
      });
      const result = res.data.result;
      toast.success(
        result.passed
          ? `Assessment passed! Score ${result.percentage}% (${result.level})`
          : `Scored ${result.percentage}% — needs improvement`
      );
      setActiveTest(null);
      setAnswers({});
      refreshHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const refreshHistory = async () => {
    if (!workerId) return;
    try {
      const res = await api.get(`/assessments/worker/${workerId}`);
      setHistory(res.data.assessments || []);
    } catch (err) {
      console.error('Failed to refresh history:', err);
    }
  };

  const profile = user?.workerProfile || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading assessments..." />
      </div>
    );
  }

  if (activeTest) {
    const questions = activeTest.questions || [];
    const question = questions[currentQuestion];

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{activeTest.title || 'Skill Assessment'}</h2>
            <span className="text-sm text-gray-500">
              <Clock className="inline w-4 h-4 mr-1" />
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${questions.length ? ((currentQuestion + 1) / questions.length) * 100 : 0}%` }}
            />
          </div>

          {question ? (
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-gray-900 font-medium">{question.question || question.text}</p>
                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 bg-gray-50 rounded-lg px-2 py-1">
                  {question.points} pts
                </span>
              </div>
              <div className="space-y-2">
                {(question.options || []).map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(currentQuestion, typeof option === 'string' ? option : option.text)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      answers[currentQuestion] === (typeof option === 'string' ? option : option.text)
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {typeof option === 'string' ? option : option.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No questions available</p>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Previous
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="btn-primary text-sm"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitTest}
                disabled={submitting}
                className="btn-primary text-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            )}
          </div>
        </div>
        <button onClick={() => setActiveTest(null)} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to assessments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-3 flex-wrap">
        <SkillBadge level={profile.skillLevel || 'basic'} size="md" />
        <span className="text-sm text-gray-500">
          Current Score: {profile.skillScore || 0}
        </span>
        <p className="text-sm text-gray-500 w-full sm:w-auto sm:ml-auto">
          Complete a practical assessment to earn a higher Skill Score
        </p>
      </div>

      {categories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Assessments</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {categories.map((test) => (
              <motion.div
                key={test.category}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{test.title}</h4>
                    <p className="text-xs text-gray-500">
                      {test.questionCount} questions • {test.totalPoints} points
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => startTest(test.category)}
                  disabled={starting}
                  className="btn-primary text-sm w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {starting ? 'Starting...' : 'Start Assessment'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment History</h3>
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No assessments taken yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((assessment, i) => (
              <motion.div
                key={assessment.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    (assessment.percentage || 0) >= 70 ? 'bg-green-50' : (assessment.percentage || 0) >= 50 ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    {(assessment.percentage || 0) >= 70 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{assessment.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{formatDate(assessment.completedAt || assessment.attemptedAt)}</p>
                      <SkillBadge level={assessment.level || 'basic'} size="sm" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    (assessment.percentage || 0) >= 70 ? 'text-green-600' : (assessment.percentage || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {assessment.percentage || 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {assessment.passed ? 'Passed' : 'Needs Improvement'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}