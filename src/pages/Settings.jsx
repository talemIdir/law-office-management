import React, { useState, useEffect } from 'react';
import { settingAPI } from '../utils/api';

function SettingsPage() {
  const [settings, setSettings] = useState({
    officeName: '',
    officeAddress: '',
    officePhone: '',
    officeEmail: '',
    taxId: '',
    registrationNumber: '',
    bankName: '',
    bankAccountNumber: '',
    bankIBAN: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const result = await settingAPI.getAll();
    if (result.success && result.data.length > 0) {
      const settingsObj = {};
      result.data.forEach((setting) => {
        settingsObj[setting.key] = setting.value;
      });
      setSettings({ ...settings, ...settingsObj });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');

    try {
      for (const [key, value] of Object.entries(settings)) {
        const existingResult = await settingAPI.getAll();
        const existing = existingResult.data?.find((s) => s.key === key);

        if (existing) {
          await settingAPI.update(existing.id, { key, value, category: 'office' });
        } else {
          await settingAPI.create({ key, value, category: 'office' });
        }
      }

      setSuccessMessage('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">الإعدادات</h1>
      </div>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>معلومات المكتب</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">اسم المكتب</label>
            <input
              type="text"
              name="officeName"
              className="form-control"
              value={settings.officeName}
              onChange={handleChange}
              placeholder="مكتب المحامي..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">عنوان المكتب</label>
            <textarea
              name="officeAddress"
              className="form-textarea"
              value={settings.officeAddress}
              onChange={handleChange}
              rows="2"
              placeholder="العنوان الكامل للمكتب..."
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">رقم الهاتف</label>
              <input
                type="tel"
                name="officePhone"
                className="form-control"
                value={settings.officePhone}
                onChange={handleChange}
                placeholder="+213..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input
                type="email"
                name="officeEmail"
                className="form-control"
                value={settings.officeEmail}
                onChange={handleChange}
                placeholder="office@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">الرقم الجبائي</label>
              <input
                type="text"
                name="taxId"
                className="form-control"
                value={settings.taxId}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">رقم التسجيل</label>
              <input
                type="text"
                name="registrationNumber"
                className="form-control"
                value={settings.registrationNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>المعلومات البنكية</h3>

          <div className="form-group">
            <label className="form-label">اسم البنك</label>
            <input
              type="text"
              name="bankName"
              className="form-control"
              value={settings.bankName}
              onChange={handleChange}
              placeholder="مثال: بنك الجزائر الخارجي"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">رقم الحساب البنكي</label>
              <input
                type="text"
                name="bankAccountNumber"
                className="form-control"
                value={settings.bankAccountNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">رقم IBAN</label>
              <input
                type="text"
                name="bankIBAN"
                className="form-control"
                value={settings.bankIBAN}
                onChange={handleChange}
                placeholder="DZ..."
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>معلومات النظام</h3>
        <div style={{ color: '#666' }}>
          <p>
            <strong>الإصدار:</strong> 1.0.0
          </p>
          <p>
            <strong>النظام:</strong> نظام إدارة مكتب المحاماة - الجزائر
          </p>
          <p>
            <strong>التقنيات:</strong> Electron + React + Vite + SQLite3 + Sequelize
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
