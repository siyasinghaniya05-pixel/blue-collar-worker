import { CheckCircle2, Circle, Shield, Wrench, Award, FileCheck, UserCheck } from 'lucide-react';

const verificationTypes = [
  { key: 'identity', label: 'Identity Verified', icon: UserCheck, description: 'Government ID verified' },
  { key: 'practicalSkill', label: 'Skill Verified', icon: Wrench, description: 'Practical skill assessment passed' },
  { key: 'experience', label: 'Experience Verified', icon: Award, description: 'Work experience validated' },
  { key: 'certification', label: 'Certified', icon: FileCheck, description: 'Professional certification confirmed' },
  { key: 'background', label: 'Background Clear', icon: Shield, description: 'Background check completed' },
];

export default function VerificationBadge({ verifications = {}, compact = false }) {
  if (compact) {
    const verifiedCount = verificationTypes.filter((v) => verifications[v.key]).length;
    const total = verificationTypes.length;

    if (verifiedCount === 0) return null;

    return (
      <div className="relative group inline-flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          {verificationTypes.map((v) => {
            const verified = verifications[v.key];
            return verified ? (
              <CheckCircle2 key={v.key} className="w-3.5 h-3.5 text-green-500" />
            ) : null;
          })}
        </div>
        <span className="text-xs text-gray-500">
          {verifiedCount}/{total} verified
        </span>

        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg w-48">
            {verificationTypes.map((v) => {
              const verified = verifications[v.key];
              return (
                <div key={v.key} className="flex items-center gap-2 py-1">
                  {verified ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  )}
                  <span className={verified ? 'text-gray-200' : 'text-gray-500'}>
                    {v.label}
                  </span>
                </div>
              );
            })}
            <div className="absolute top-full left-4 w-2 h-2 bg-gray-900 transform rotate-45 -mt-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {verificationTypes.map((v) => {
        const Icon = v.icon;
        const verified = verifications[v.key];
        return (
          <div
            key={v.key}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
              verified
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            {verified ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-3.5 text-gray-300 flex-shrink-0" />
            )}
            <Icon className={`w-4 h-4 ${verified ? 'text-green-600' : 'text-gray-400'}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${verified ? 'text-green-800' : 'text-gray-500'}`}>
                {v.label}
              </p>
              <p className="text-xs text-gray-400">{v.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
