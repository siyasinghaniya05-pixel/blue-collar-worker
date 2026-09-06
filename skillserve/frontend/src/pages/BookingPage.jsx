import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, MapPin, IndianRupee, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import SkillBadge from '../components/common/SkillBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getInitials, formatCurrency, getSkillLevelConfig } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get('worker');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    serviceSubcategory: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!workerId) {
      toast.error('No worker selected');
      navigate('/search');
      return;
    }
    const fetchWorker = async () => {
      try {
        const res = await api.get(`/workers/${workerId}`);
        const w = res.data.worker || res.data;
        setWorker(w);
        if (w?.serviceCategory) {
          try {
            const svcRes = await api.get(`/services/category/${w.serviceCategory}`);
            const svcList = svcRes.data.services || [];
            setServices(svcList);
            if (svcList.length > 0) {
              setFormData((prev) => ({ ...prev, serviceId: svcList[0]._id }));
            }
          } catch (err) {
            console.error('Failed to load services for category:', err);
          }
        }
      } catch (err) {
        toast.error('Worker not found');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [workerId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { serviceId, description, scheduledDate, scheduledTime, street, city, state, pincode } = formData;
    if (!serviceId || !description || !scheduledDate || !scheduledTime || !street || !city || !state || !pincode) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        workerId,
        serviceId,
        serviceSubcategory: formData.serviceSubcategory || undefined,
        description,
        address: { street, city, state, pincode },
        scheduledDate,
        scheduledTime,
        estimatedPrice: worker?.pricing?.min || services.find((s) => s._id === serviceId)?.basePrice,
      });
      toast.success('Booking request sent!');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading worker details..." />
      </div>
    );
  }

  if (!worker) return null;

  const user_ = worker.user || {};
  const levelConfig = getSkillLevelConfig(worker.skillLevel || 'basic');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Book This Worker</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-lg font-bold">
                {getInitials(user_.name || 'W')}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user_.name || 'Worker'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <SkillBadge level={worker.skillLevel || 'basic'} size="sm" />
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {formatCurrency(worker.pricing?.min)} - {formatCurrency(worker.pricing?.max)}/job
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {levelConfig.label} · {worker.stats?.jobsCompleted || 0} jobs completed
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Service *</label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select service</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field min-h-[100px]"
                placeholder="Describe the work you need done..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Date *</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="input-field pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Service Address *
              </p>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="input-field"
                placeholder="Street / House / Building *"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="City *"
                  required
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="State *"
                  required
                />
              </div>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="input-field"
                placeholder="Pincode *"
                pattern="[0-9]{6}"
                title="Enter a valid 6-digit pincode"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Send Booking Request
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}