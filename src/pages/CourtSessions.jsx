import React, { useState, useEffect } from 'react';
import { courtSessionAPI, caseAPI } from '../utils/api';

function CourtSessionModal({ session, onClose, onSave }) {
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    sessionDate: '',
    sessionType: 'hearing',
    court: '',
    courtRoom: '',
    judge: '',
    attendees: '',
    outcome: '',
    nextSessionDate: '',
    notes: '',
    status: 'scheduled',
    caseId: '',
    ...session
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    const result = await caseAPI.getAll({
      where: { status: ['open', 'in_progress'] }
    });
    if (result.success) {
      setCases(result.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {session ? 'تعديل بيانات جلسة' : 'إضافة جلسة جديدة'}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required">القضية</label>
              <select
                name="caseId"
                className="form-select"
                value={formData.caseId}
                onChange={handleChange}
                required
              >
                <option value="">اختر القضية</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">تاريخ ووقت الجلسة</label>
                <input
                  type="datetime-local"
                  name="sessionDate"
                  className="form-control"
                  value={formData.sessionDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label required">نوع الجلسة</label>
                <select
                  name="sessionType"
                  className="form-select"
                  value={formData.sessionType}
                  onChange={handleChange}
                  required
                >
                  <option value="hearing">جلسة استماع</option>
                  <option value="verdict">جلسة حكم</option>
                  <option value="procedural">جلسة إجرائية</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">المحكمة</label>
                <input
                  type="text"
                  name="court"
                  className="form-control"
                  value={formData.court}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">قاعة الجلسة</label>
                <input
                  type="text"
                  name="courtRoom"
                  className="form-control"
                  value={formData.courtRoom}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">القاضي</label>
              <input
                type="text"
                name="judge"
                className="form-control"
                value={formData.judge}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">الحاضرون</label>
              <textarea
                name="attendees"
                className="form-textarea"
                value={formData.attendees}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">نتيجة الجلسة</label>
              <textarea
                name="outcome"
                className="form-textarea"
                value={formData.outcome}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">موعد الجلسة القادمة</label>
                <input
                  type="datetime-local"
                  name="nextSessionDate"
                  className="form-control"
                  value={formData.nextSessionDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="scheduled">مجدولة</option>
                  <option value="completed">مكتملة</option>
                  <option value="postponed">مؤجلة</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {session ? 'حفظ التعديلات' : 'إضافة جلسة'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CourtSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const result = await courtSessionAPI.getAll();
    if (result.success) {
      setSessions(result.data);
    }
    setLoading(false);
  };

  const handleSave = async (formData) => {
    try {
      let result;
      if (selectedSession) {
        result = await courtSessionAPI.update(selectedSession.id, formData);
      } else {
        result = await courtSessionAPI.create(formData);
      }

      if (result.success) {
        setShowModal(false);
        setSelectedSession(null);
        loadSessions();
      } else {
        alert('خطأ: ' + result.error);
      }
    } catch (error) {
      alert('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
      const result = await courtSessionAPI.delete(id);
      if (result.success) {
        loadSessions();
      } else {
        alert('خطأ: ' + result.error);
      }
    }
  };

  const handleEdit = (session) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedSession(null);
    setShowModal(true);
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesType = filterType === 'all' || session.sessionType === filterType;
    return matchesStatus && matchesType;
  });

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h1 className="page-title">إدارة الجلسات</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة جلسة جديدة
        </button>
      </div>

      <div className="card">
        <div className="search-container">
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">جميع الأنواع</option>
            <option value="hearing">جلسة استماع</option>
            <option value="verdict">جلسة حكم</option>
            <option value="procedural">جلسة إجرائية</option>
            <option value="other">أخرى</option>
          </select>
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="scheduled">مجدولة</option>
            <option value="completed">مكتملة</option>
            <option value="postponed">مؤجلة</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>

        {filteredSessions.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>التاريخ والوقت</th>
                  <th>رقم القضية</th>
                  <th>النوع</th>
                  <th>المحكمة</th>
                  <th>القاعة</th>
                  <th>القاضي</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id}>
                    <td>{formatDateTime(session.sessionDate)}</td>
                    <td>{session.caseId ? `#${session.caseId}` : '-'}</td>
                    <td>
                      <span className="badge badge-info">
                        {session.sessionType === 'hearing' && 'جلسة استماع'}
                        {session.sessionType === 'verdict' && 'جلسة حكم'}
                        {session.sessionType === 'procedural' && 'جلسة إجرائية'}
                        {session.sessionType === 'other' && 'أخرى'}
                      </span>
                    </td>
                    <td>{session.court || '-'}</td>
                    <td>{session.courtRoom || '-'}</td>
                    <td>{session.judge || '-'}</td>
                    <td>
                      <span
                        className={`badge ${
                          session.status === 'scheduled'
                            ? 'badge-warning'
                            : session.status === 'completed'
                            ? 'badge-success'
                            : session.status === 'postponed'
                            ? 'badge-info'
                            : 'badge-danger'
                        }`}
                      >
                        {session.status === 'scheduled' && 'مجدولة'}
                        {session.status === 'completed' && 'مكتملة'}
                        {session.status === 'postponed' && 'مؤجلة'}
                        {session.status === 'cancelled' && 'ملغاة'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(session)}
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(session.id)}
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🏛️</div>
            <p className="empty-state-title">لا توجد نتائج</p>
            <p className="empty-state-description">لم يتم إضافة أي جلسات بعد</p>
            <button className="btn btn-primary" onClick={handleAdd}>
              ➕ إضافة جلسة جديدة
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <CourtSessionModal
          session={selectedSession}
          onClose={() => {
            setShowModal(false);
            setSelectedSession(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default CourtSessionsPage;
