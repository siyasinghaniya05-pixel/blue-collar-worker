import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, MapPin, Briefcase, IndianRupee, Plus, X } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const categoryOptions = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mason',
  'Welder', 'AC Technician', 'Mechanic', 'Tailor', 'Cook', 'Gardener',
];

export default function WorkerProfileEditPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    category: '',
    experience: '',
    hourlyRate: '',
    skills: [],
    serviceArea: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    if (user) {
      const profile = user.workerProfile || {};
      const loc = user.location || {};
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: [loc.city, loc.state].filter(Boolean).join(', ') || '',
        bio: profile.bio || '',
        category: profile.serviceCategory || '',
        experience: profile.experience || '',
        hourlyRate: profile.pricing?.min || '',
        skills: profile.serviceSubcategories || profile.skills || [],
        serviceArea: [],
      });
    }
    setLoading(false);
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const addArea = () => {
    if (newArea.trim() && !formData.serviceArea.includes(newArea.trim())) {
      setFormData({ ...formData, serviceArea: [...formData.serviceArea, newArea.trim()] });
      setNewArea('');
    }
  };

  const removeArea = (area) => {
    setFormData({ ...formData, serviceArea: formData.serviceArea.filter((a) => a !== area) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formData.name || formData.phone) {
        await api.put('/auth/updateprofile', {
          name: formData.name,
          phone: formData.phone,
          location: { city: formData.location.split(',')[0]?.trim() || '', state: formData.location.split(',')[1]?.trim() || '' },
        });
      }

      await api.put('/workers/profile', {
        serviceCategory: formData.category,
        serviceSubcategories: formData.skills,
        bio: formData.bio,
        experience: Number(formData.experience) || 0,
      });

      const rate = Number(formData.hourlyRate) || 0;
      if (rate > 0) {
        await api.put('/workers/pricing', { min: rate, max: rate });
      }

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="input-field min-h-[80px]"
                  placeholder="Tell customers about yourself..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field pl-10"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hourly Rate (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      className="input-field pl-10"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input-field flex-1"
                placeholder="Add a skill"
              />
              <button type="button" onClick={addSkill} className="btn-secondary text-sm px-4">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-primary-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Areas</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                className="input-field flex-1"
                placeholder="Add a service area"
              />
              <button type="button" onClick={addArea} className="btn-secondary text-sm px-4">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.serviceArea.map((area) => (
                <span key={area} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                  {area}
                  <button type="button" onClick={() => removeArea(area)} className="hover:text-green-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </form>
      </div>
  );
}
