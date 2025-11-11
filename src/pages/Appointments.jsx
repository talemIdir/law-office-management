import React, { useState, useEffect } from 'react';
import { appointmentAPI, clientAPI, caseAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/toast';
import { useConfirm } from '../components/ConfirmDialog';

function AppointmentModal({ appointment, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    appointmentDate: '',
    duration: '60',
    location: '',
    appointmentType: 'meeting',
    status: 'scheduled',
    reminderSent: false,
    notes: '',
    clientId: '',
    caseId: '',
    ...appointment
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [clientsResult, casesResult] = await Promise.all([
      clientAPI.getAll(),
      caseAPI.getAll()
    ]);
    if (clientsResult.success) setClients(clientsResult.data);
    if (casesResult.success) setCases(casesResult.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {appointment ? 'تعديل موعد' : 'إضافة موعد جديد'}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required">عنوان الموعد</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">تاريخ ووقت الموعد</label>
                <input
                  type="datetime-local"
                  name="appointmentDate"
                  className="form-control"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label required">المدة (دقائق)</label>
                <input
                  type="number"
                  name="duration"
                  className="form-control"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="15"
                  step="15"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الموكل</label>
                <select
                  name="clientId"
                  className="form-select"
                  value={formData.clientId}
                  onChange={handleChange}
                >
                  <option value="">اختر الموكل</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.type === 'company'
                        ? client.companyName
                        : `${client.firstName} ${client.lastName}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">القضية</label>
                <select
                  name="caseId"
                  className="form-select"
                  value={formData.caseId}
                  onChange={handleChange}
                >
                  <option value="">اختر القضية</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">نوع الموعد</label>
                <select
                  name="appointmentType"
                  className="form-select"
                  value={formData.appointmentType}
                  onChange={handleChange}
                  required
                >
                  <option value="consultation">استشارة</option>
                  <option value="meeting">اجتماع</option>
                  <option value="court_session">جلسة محكمة</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="scheduled">مجدول</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغى</option>
                  <option value="rescheduled">معاد جدولة</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">الموقع</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
              />
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
              {appointment ? 'حفظ التعديلات' : 'إضافة موعد'}
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

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const confirm = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [appointmentsResult, clientsResult] = await Promise.all([
      appointmentAPI.getAll(),
      clientAPI.getAll()
    ]);

    if (appointmentsResult.success) setAppointments(appointmentsResult.data);
    if (clientsResult.success) setClients(clientsResult.data);
    setLoading(false);
  };

  const handleSave = async (formData) => {
    try {
      let result;
      if (selectedAppointment) {
        result = await appointmentAPI.update(selectedAppointment.id, formData);
      } else {
        result = await appointmentAPI.create(formData);
      }

      if (result.success) {
        setShowModal(false);
        setSelectedAppointment(null);
        loadData();
        showSuccess(selectedAppointment ? 'تم تحديث بيانات الموعد بنجاح' : 'تم إضافة الموعد بنجاح');
      } else {
        showError('خطأ: ' + result.error);
      }
    } catch (error) {
      showError('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذا الموعد؟',
      confirmText: 'نعم، احذف',
      cancelText: 'إلغاء'
    });

    if (confirmed) {
      const result = await appointmentAPI.delete(id);
      if (result.success) {
        loadData();
        showSuccess('تم حذف الموعد بنجاح');
      } else {
        showError('خطأ: ' + result.error);
      }
    }
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedAppointment(null);
    setShowModal(true);
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return '-';
    return client.type === 'company'
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesType = filterType === 'all' || appointment.appointmentType === filterType;
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
        <h1 className="page-title">إدارة المواعيد</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة موعد جديد
        </button>
      </div>

      <div className="card">
        <div className="search-container">
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">جميع الأنواع</option>
            <option value="consultation">استشارة</option>
            <option value="meeting">اجتماع</option>
            <option value="court_session">جلسة محكمة</option>
            <option value="other">أخرى</option>
          </select>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="scheduled">مجدول</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغى</option>
            <option value="rescheduled">معاد جدولة</option>
          </select>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>التاريخ والوقت</th>
                  <th>العنوان</th>
                  <th>الموكل</th>
                  <th>النوع</th>
                  <th>المدة</th>
                  <th>الموقع</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{formatDateTime(appointment.appointmentDate)}</td>
                    <td>{appointment.title}</td>
                    <td>{appointment.clientId ? getClientName(appointment.clientId) : '-'}</td>
                    <td>
                      <span className="badge badge-primary">
                        {appointment.appointmentType === 'consultation' && 'استشارة'}
                        {appointment.appointmentType === 'meeting' && 'اجتماع'}
                        {appointment.appointmentType === 'court_session' && 'جلسة محكمة'}
                        {appointment.appointmentType === 'other' && 'أخرى'}
                      </span>
                    </td>
                    <td>{appointment.duration} دقيقة</td>
                    <td>{appointment.location || '-'}</td>
                    <td>
                      <span
                        className={`badge ${
                          appointment.status === 'scheduled'
                            ? 'badge-warning'
                            : appointment.status === 'completed'
                            ? 'badge-success'
                            : appointment.status === 'cancelled'
                            ? 'badge-danger'
                            : 'badge-info'
                        }`}
                      >
                        {appointment.status === 'scheduled' && 'مجدول'}
                        {appointment.status === 'completed' && 'مكتمل'}
                        {appointment.status === 'cancelled' && 'ملغى'}
                        {appointment.status === 'rescheduled' && 'معاد جدولة'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(appointment)}
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(appointment.id)}
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
            <div className="empty-state-icon">📅</div>
            <p className="empty-state-title">لا توجد نتائج</p>
            <p className="empty-state-description">لم يتم إضافة أي مواعيد بعد</p>
            <button className="btn btn-primary" onClick={handleAdd}>
              ➕ إضافة موعد جديد
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default AppointmentsPage;
