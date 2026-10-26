import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Bell, AlertTriangle, Save } from 'lucide-react';

interface PriceChange {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
}

export const PriceChangeLogTable: React.FC = () => {
  const [logs, setLogs] = useState<PriceChange[]>([]);
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'price_change_logs'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PriceChange));
      
      // Fetch thresholds for unique products in logs
      const productIds = Array.from(new Set(logsData.map(l => l.productId)));
      const newThresholds = { ...thresholds };
      
      for (const pid of productIds) {
        if (newThresholds[pid] === undefined) {
          const pRef = doc(db, 'users', auth.currentUser!.uid, 'products', pid);
          const pSnap = await getDoc(pRef);
          if (pSnap.exists()) {
            newThresholds[pid] = pSnap.data().alertThreshold || 0;
          }
        }
      }
      setThresholds(newThresholds);

      // Check for new logs
      if (!isInitialLoad.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data() as PriceChange;
            const threshold = newThresholds[data.productId] || 0;
            
            setToastMessage(`تنبيه: تغير سعر المنتج ${data.productName} إلى ${data.newPrice.toLocaleString()}!`);
            
            if (threshold > 0 && data.newPrice < threshold) {
              setToastMessage(`🚨 تنبيه ذكي: سعر ${data.productName} (${data.newPrice}) أقل من الحد المسموح به (${threshold})!`);
            }
            
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 8000);
          }
        });
      }
      
      setLogs(logsData);
      isInitialLoad.current = false;
    });

    return () => {
      unsubscribe();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const updateThreshold = async (productId: string, newThreshold: number) => {
    if (!auth.currentUser) return;
    const pRef = doc(db, 'users', auth.currentUser.uid, 'products', productId);
    await setDoc(pRef, { alertThreshold: newThreshold }, { merge: true });
    setThresholds(prev => ({ ...prev, [productId]: newThreshold }));
  };

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-800 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`absolute top-4 right-4 z-50 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right-4 ${toastMessage.includes('🚨') ? 'bg-rose-600' : 'bg-indigo-600'}`}>
          {toastMessage.includes('🚨') ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
      
      <table className="w-full text-right text-xs border-collapse">
        <thead>
          <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <th className="py-2.5 px-3">التاريخ</th>
            <th className="py-2.5 px-3">اسم المنتج</th>
            <th className="py-2.5 px-3">السعر السابق</th>
            <th className="py-2.5 px-3">السعر الجديد</th>
            <th className="py-2.5 px-3">حد التنبيه</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-800/40">
              <td className="py-2 px-3 text-slate-300">{new Date(log.timestamp).toLocaleString('ar-EG')}</td>
              <td className="py-2 px-3 font-bold text-slate-200">{log.productName}</td>
              <td className="py-2 px-3 font-mono text-rose-400">{log.oldPrice.toLocaleString()}</td>
              <td className={`py-2 px-3 font-mono font-bold ${ (thresholds[log.productId] && log.newPrice < thresholds[log.productId]) ? 'text-rose-500 bg-rose-950/30' : 'text-emerald-400'}`}>
                {log.newPrice.toLocaleString()}
              </td>
              <td className="py-2 px-3">
                <div className="flex items-center gap-1">
                    <input 
                        type="number"
                        className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-mono"
                        value={thresholds[log.productId] || ''}
                        placeholder="0"
                        onChange={(e) => setThresholds(prev => ({...prev, [log.productId]: Number(e.target.value)}))}
                    />
                    <button onClick={() => updateThreshold(log.productId, thresholds[log.productId] || 0)} className="text-indigo-400 hover:text-indigo-300">
                        <Save className="w-4 h-4" />
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
