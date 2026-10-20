import React, { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface TermsOfServiceModalProps {
  onAccept: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ onAccept }) => {
  const [hasAccepted, setHasAccepted] = useState(false);

  // تحقق مما إذا كان المستخدم قد وافق مسبقاً
  useEffect(() => {
    const accepted = localStorage.getItem('tos_accepted');
    if (accepted === 'true') {
      setHasAccepted(true);
    }
  }, []);

  if (hasAccepted) return null;

  const handleAccept = () => {
    localStorage.setItem('tos_accepted', 'true');
    setHasAccepted(true);
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full text-slate-100 shadow-2xl">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
          شروط الخدمة وسياسة الخصوصية
        </h2>
        
        <div className="h-64 overflow-y-auto mb-6 p-4 bg-slate-900 rounded-xl text-sm text-slate-300 space-y-4">
          <p>أهلاً بك في منصة رادار التجار. باستخدامك لهذه المنصة، أنت توافق على الشروط التالية...</p>
          <p>تلتزم المنصة بحماية بياناتك التجارية الحساسة وعدم مشاركتها مع أطراف خارجية...</p>
          {/* Add actual ToS/Privacy policy text here */}
        </div>

        <button
          onClick={handleAccept}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition cursor-pointer"
        >
          أوافق على الشروط وأرغب في المتابعة
        </button>
      </div>
    </div>
  );
};
