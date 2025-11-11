import React, { useState, useEffect } from 'react';
import { caseAPI, clientAPI } from '../utils/api';

function CaseModal({ caseData, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    description: '',
    caseType: 'civil',
    court: '',
    courtType: 'محكمة ابتدائية',
    judge: '',
    opposingParty: '',
    opposingLawyer: '',
    clientRole: 'plaintiff',
    status: 'open',
    priority: 'medium',
    startDate: '',
    endDate: '',
    nextHearingDate: '',
    amount: '',
    notes: '',
    clientId: '',
    ...caseData
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const result = await clientAPI.getAll({ where: { status: 'active' } });
    if (result.success) {
      setClients(result.data);
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
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {caseData ? 'تعديل بيانات قضية' : 'إضافة قضية جديدة'}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">رقم القضية</label>
                <input
                  type="text"
                  name="caseNumber"
                  className="form-control"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label required">الموكل</label>
                <select
                  name="clientId"
                  className="form-select"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
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
            </div>

            <div className="form-group">
              <label className="form-label required">عنوان القضية</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">وصف القضية</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">نوع القضية</label>
                <select
                  name="caseType"
                  className="form-select"
                  value={formData.caseType}
                  onChange={handleChange}
                  required
                >
                  <option value="civil">مدني</option>
                  <option value="criminal">جنائي</option>
                  <option value="commercial">تجاري</option>
                  <option value="administrative">إداري</option>
                  <option value="family">أسري</option>
                  <option value="labor">عمالي</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">دور الموكل</label>
                <select
                  name="clientRole"
                  className="form-select"
                  value={formData.clientRole}
                  onChange={handleChange}
                  required
                >
                  <option value="plaintiff">مدعي</option>
                  <option value="defendant">مدعى عليه</option>
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
                <label className="form-label">نوع المحكمة</label>
                <select
                  name="courtType"
                  className="form-select"
                  value={formData.courtType}
                  onChange={handleChange}
                >
                  <option value="محكمة ابتدائية">محكمة ابتدائية</option>
                  <option value="محكمة استئناف">محكمة استئناف</option>
                  <option value="المحكمة العليا">المحكمة العليا</option>
                  <option value="مجلس الدولة">مجلس الدولة</option>
                  <option value="محكمة الجنايات">محكمة الجنايات</option>
                </select>
              </div>
            </div>

            <div className="form-row">
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
                <label className="form-label">الطرف المقابل</label>
                <input
                  type="text"
                  name="opposingParty"
                  className="form-control"
                  value={formData.opposingParty}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">محامي الطرف المقابل</label>
              <input
                type="text"
                name="opposingLawyer"
                className="form-control"
                value={formData.opposingLawyer}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="open">مفتوحة</option>
                  <option value="in_progress">قيد المعالجة</option>
                  <option value="won">كسب</option>
                  <option value="lost">خسارة</option>
                  <option value="settled">تسوية</option>
                  <option value="closed">مغلقة</option>
                  <option value="appealed">استئناف</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الأولوية</label>
                <select
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجلة</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">تاريخ البداية</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">تاريخ الانتهاء</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">موعد الجلسة القادمة</label>
                <input
                  type="datetime-local"
                  name="nextHearingDate"
                  className="form-control"
                  value={formData.nextHearingDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">المبلغ المطالب به (دج)</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                />
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
              {caseData ? 'حفظ التعديلات' : 'إضافة قضية'}
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

function CasesPage() {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [casesResult, clientsResult] = await Promise.all([
      caseAPI.getAll({
        include: [{ model: 'Client', as: 'client' }]
      }),
      clientAPI.getAll()
    ]);

    if (casesResult.success) setCases(casesResult.data);
    if (clientsResult.success) setClients(clientsResult.data);
    setLoading(false);
  };

  const handleSave = async (formData) => {
    try {
      let result;
      if (selectedCase) {
        result = await caseAPI.update(selectedCase.id, formData);
      } else {
        result = await caseAPI.create(formData);
      }

      if (result.success) {
        setShowModal(false);
        setSelectedCase(null);
        loadData();
      } else {
        alert('خطأ: ' + result.error);
      }
    } catch (error) {
      alert('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      const result = await caseAPI.delete(id);
      if (result.success) {
        loadData();
      } else {
        alert('خطأ: ' + result.error);
      }
    }
  };

  const handleEdit = (caseData) => {
    setSelectedCase(caseData);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedCase(null);
    setShowModal(true);
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return '-';
    return client.type === 'company'
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;
  };

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch = searchTerm === '' ||
      caseItem.caseNumber.includes(searchTerm) ||
      caseItem.title.includes(searchTerm) ||
      (caseItem.opposingParty && caseItem.opposingParty.includes(searchTerm));

    const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
    const matchesType = filterType === 'all' || caseItem.caseType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-DZ');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ar-DZ', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(amount) + ' دج';
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
        <h1 className="page-title">إدارة القضايا</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة قضية جديدة
        </button>
      </div>

      <div className="card">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 البحث عن قضية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">جميع الأنواع</option>
            <option value="civil">مدني</option>
            <option value="criminal">جنائي</option>
            <option value="commercial">تجاري</option>
            <option value="administrative">إداري</option>
            <option value="family">أسري</option>
            <option value="labor">عمالي</option>
            <option value="other">أخرى</option>
          </select>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="open">مفتوحة</option>
            <option value="in_progress">قيد المعالجة</option>
            <option value="won">كسب</option>
            <option value="lost">خسارة</option>
            <option value="settled">تسوية</option>
            <option value="closed">مغلقة</option>
            <option value="appealed">استئناف</option>
          </select>
        </div>

        {filteredCases.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>رقم القضية</th>
                  <th>العنوان</th>
                  <th>الموكل</th>
                  <th>النوع</th>
                  <th>المحكمة</th>
                  <th>الحالة</th>
                  <th>الأولوية</th>
                  <th>المبلغ</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td><strong>{caseItem.caseNumber}</strong></td>
                    <td>{caseItem.title}</td>
                    <td>{getClientName(caseItem.clientId)}</td>
                    <td>
                      <span className="badge badge-secondary">
                        {caseItem.caseType === 'civil' && 'مدني'}
                        {caseItem.caseType === 'criminal' && 'جنائي'}
                        {caseItem.caseType === 'commercial' && 'تجاري'}
                        {caseItem.caseType === 'administrative' && 'إداري'}
                        {caseItem.caseType === 'family' && 'أسري'}
                        {caseItem.caseType === 'labor' && 'عمالي'}
                        {caseItem.caseType === 'other' && 'أخرى'}
                      </span>
                    </td>
                    <td>{caseItem.court || '-'}</td>
                    <td>
                      <span
                        className={`badge ${
                          caseItem.status === 'won'
                            ? 'badge-success'
                            : caseItem.status === 'lost'
                            ? 'badge-danger'
                            : caseItem.status === 'in_progress'
                            ? 'badge-info'
                            : caseItem.status === 'settled'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >
                        {caseItem.status === 'open' && 'مفتوحة'}
                        {caseItem.status === 'in_progress' && 'قيد المعالجة'}
                        {caseItem.status === 'won' && 'كسب'}
                        {caseItem.status === 'lost' && 'خسارة'}
                        {caseItem.status === 'settled' && 'تسوية'}
                        {caseItem.status === 'closed' && 'مغلقة'}
                        {caseItem.status === 'appealed' && 'استئناف'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          caseItem.priority === 'urgent'
                            ? 'badge-danger'
                            : caseItem.priority === 'high'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {caseItem.priority === 'low' && 'منخفضة'}
                        {caseItem.priority === 'medium' && 'متوسطة'}
                        {caseItem.priority === 'high' && 'عالية'}
                        {caseItem.priority === 'urgent' && 'عاجلة'}
                      </span>
                    </td>
                    <td>{formatCurrency(caseItem.amount)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(caseItem)}
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(caseItem.id)}
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
            <div className="empty-state-icon">⚖️</div>
            <p className="empty-state-title">لا توجد نتائج</p>
            <p className="empty-state-description">
              {searchTerm
                ? 'لم يتم العثور على قضايا مطابقة للبحث'
                : 'لم يتم إضافة أي قضايا بعد'}
            </p>
            {!searchTerm && (
              <button className="btn btn-primary" onClick={handleAdd}>
                ➕ إضافة قضية جديدة
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <CaseModal
          caseData={selectedCase}
          onClose={() => {
            setShowModal(false);
            setSelectedCase(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default CasesPage;
