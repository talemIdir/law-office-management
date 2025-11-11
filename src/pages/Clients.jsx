import React, { useState, useEffect } from 'react';
import { clientAPI } from '../utils/api';

function ClientModal({ client, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type: 'individual',
    firstName: '',
    lastName: '',
    companyName: '',
    nationalId: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    wilaya: '',
    notes: '',
    status: 'active',
    ...client
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const wilayas = [
    'الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'بليدة', 'باتنة', 'سطيف', 'سيدي بلعباس',
    'بسكرة', 'تبسة', 'تلمسان', 'بجاية', 'جيجل', 'سكيكدة', 'تيارت', 'بشار',
    'مستغانم', 'المسيلة', 'الشلف', 'الأغواط', 'غرداية', 'ورقلة', 'البويرة', 'تيزي وزو'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {client ? 'تعديل بيانات موكل' : 'إضافة موكل جديد'}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required">نوع الموكل</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="individual">فرد</option>
                <option value="company">شركة</option>
              </select>
            </div>

            {formData.type === 'individual' ? (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">الاسم الأول</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">اسم العائلة</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label required">اسم الشركة</label>
                <input
                  type="text"
                  name="companyName"
                  className="form-control"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">رقم البطاقة الوطنية</label>
                <input
                  type="text"
                  name="nationalId"
                  className="form-control"
                  value={formData.nationalId}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">الرقم الجبائي</label>
                <input
                  type="text"
                  name="taxId"
                  className="form-control"
                  value={formData.taxId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">العنوان</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">المدينة</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">الولاية</label>
                <select
                  name="wilaya"
                  className="form-select"
                  value={formData.wilaya}
                  onChange={handleChange}
                >
                  <option value="">اختر الولاية</option>
                  {wilayas.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
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

            <div className="form-group">
              <label className="form-label">الحالة</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {client ? 'حفظ التعديلات' : 'إضافة موكل'}
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

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const result = await clientAPI.getAll();
    if (result.success) {
      setClients(result.data);
    }
    setLoading(false);
  };

  const handleSave = async (formData) => {
    try {
      let result;
      if (selectedClient) {
        result = await clientAPI.update(selectedClient.id, formData);
      } else {
        result = await clientAPI.create(formData);
      }

      if (result.success) {
        setShowModal(false);
        setSelectedClient(null);
        loadClients();
      } else {
        alert('خطأ: ' + result.error);
      }
    } catch (error) {
      alert('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الموكل؟')) {
      const result = await clientAPI.delete(id);
      if (result.success) {
        loadClients();
      } else {
        alert('خطأ: ' + result.error);
      }
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedClient(null);
    setShowModal(true);
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = searchTerm === '' ||
      (client.firstName && client.firstName.includes(searchTerm)) ||
      (client.lastName && client.lastName.includes(searchTerm)) ||
      (client.companyName && client.companyName.includes(searchTerm)) ||
      (client.phone && client.phone.includes(searchTerm));

    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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
        <h1 className="page-title">إدارة الموكلين</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة موكل جديد
        </button>
      </div>

      <div className="card">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 البحث عن موكل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>

        {filteredClients.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>النوع</th>
                  <th>رقم الهاتف</th>
                  <th>البريد الإلكتروني</th>
                  <th>الولاية</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      {client.type === 'company'
                        ? client.companyName
                        : `${client.firstName} ${client.lastName}`}
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {client.type === 'individual' ? 'فرد' : 'شركة'}
                      </span>
                    </td>
                    <td>{client.phone}</td>
                    <td>{client.email || '-'}</td>
                    <td>{client.wilaya || '-'}</td>
                    <td>
                      <span
                        className={`badge ${
                          client.status === 'active'
                            ? 'badge-success'
                            : client.status === 'inactive'
                            ? 'badge-warning'
                            : 'badge-secondary'
                        }`}
                      >
                        {client.status === 'active' && 'نشط'}
                        {client.status === 'inactive' && 'غير نشط'}
                        {client.status === 'archived' && 'مؤرشف'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(client)}
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(client.id)}
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
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-title">لا توجد نتائج</p>
            <p className="empty-state-description">
              {searchTerm
                ? 'لم يتم العثور على موكلين مطابقين للبحث'
                : 'لم يتم إضافة أي موكلين بعد'}
            </p>
            {!searchTerm && (
              <button className="btn btn-primary" onClick={handleAdd}>
                ➕ إضافة موكل جديد
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ClientModal
          client={selectedClient}
          onClose={() => {
            setShowModal(false);
            setSelectedClient(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ClientsPage;
