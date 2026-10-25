import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface WhatsAppAlertSettings {
  phoneNumber: string;
  isEnabled: boolean;
  notifyOnPriceChange: boolean;
  notifyOnInventoryLow: boolean;
}

export const WhatsAppAlertSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [settings, setSettings] = useState<WhatsAppAlertSettings>({
    phoneNumber: '',
    isEnabled: false,
    notifyOnPriceChange: true,
    notifyOnInventoryLow: true,
  });
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;
      const docRef = doc(db, 'users', userId, 'whatsapp_settings', 'config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as WhatsAppAlertSettings);
      }
    };
    loadSettings();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'users', userId, 'whatsapp_settings', 'config');
      await setDoc(docRef, {
        ...settings,
        userId: userId,
        updatedAt: serverTimestamp(),
      });
      onClose();
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">إعدادات تنبيهات واتساب</h2>
        <input
          type="text"
          placeholder="رقم الواتساب (مثال: 201012345678)"
          value={settings.phoneNumber}
          onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
          className="w-full border p-2 mb-4"
        />
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={settings.isEnabled}
            onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
            className="mr-2"
          />
          تفعيل تنبيهات الواتساب
        </label>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={settings.notifyOnPriceChange}
            onChange={(e) => setSettings({ ...settings, notifyOnPriceChange: e.target.checked })}
            className="mr-2"
          />
          تنبيهات عند تغير الأسعار
        </label>
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={settings.notifyOnInventoryLow}
            onChange={(e) => setSettings({ ...settings, notifyOnInventoryLow: e.target.checked })}
            className="mr-2"
          />
          تنبيهات عند انخفاض المخزون
        </label>
        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 p-2 bg-gray-200">إلغاء</button>
          <button onClick={handleSave} className="p-2 bg-blue-500 text-white" disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
};
