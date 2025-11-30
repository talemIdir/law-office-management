import React, { useState, useEffect, useMemo, useRef } from "react";
import { appointmentAPI, clientAPI, caseAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import { getStatusLabel, getAppointmentTypeLabel } from "../utils/labels";
import { exportToExcel, exportToPDF, formatAppointmentsForExcel, formatAppointmentsForPDF } from "../utils/exportUtils";
import PDFListDocument from "../components/PDFListDocument";

function AppointmentModal({ appointment, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [caseSearchTerm, setCaseSearchTerm] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const clientDropdownRef = useRef(null);
  const caseDropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    appointmentDate: "",
    duration: "60",
    location: "",
    appointmentType: "meeting",
    status: "scheduled",
    reminderSent: false,
    notes: "",
    clientId: "",
    caseId: "",
    ...appointment,
    // Ensure null values are converted to empty strings for select fields
    clientId: appointment?.clientId || "",
    caseId: appointment?.caseId || "",
    location: appointment?.location || "",
    notes: appointment?.notes || "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Set initial search terms when editing
    if (appointment && appointment.clientId && clients.length > 0) {
      const selectedClient = clients.find(c => c.id === appointment.clientId);
      if (selectedClient) {
        const displayName = selectedClient.type === "company"
          ? selectedClient.companyName
          : `${selectedClient.firstName} ${selectedClient.lastName}`;
        setClientSearchTerm(displayName);
      }
    }
  }, [appointment, clients]);

  useEffect(() => {
    // Set initial case search term
    if (appointment && appointment.caseId && cases.length > 0) {
      const selectedCase = cases.find(c => c.id === appointment.caseId);
      if (selectedCase) {
        setCaseSearchTerm(`${selectedCase.caseNumber} - ${selectedCase.title}`);
      }
    }
  }, [appointment, cases]);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
      if (caseDropdownRef.current && !caseDropdownRef.current.contains(event.target)) {
        setShowCaseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadData = async () => {
    const [clientsResult, casesResult] = await Promise.all([
      clientAPI.getAll(),
      caseAPI.getAll(),
    ]);
    if (clientsResult.success) setClients(clientsResult.data);
    if (casesResult.success) setCases(casesResult.data);
  };

  const filteredClients = useMemo(() => {
    if (!clientSearchTerm) return clients.slice(0, 10);

    const searchLower = clientSearchTerm.toLowerCase();
    return clients.filter(client => {
      const displayName = client.type === "company"
        ? client.companyName
        : `${client.firstName} ${client.lastName}`;
      return displayName.toLowerCase().includes(searchLower);
    }).slice(0, 10);
  }, [clients, clientSearchTerm]);

  const filteredCasesForSearch = useMemo(() => {
    // Filter cases by clientId if selected
    const casesToSearch = formData.clientId
      ? cases.filter(c => c.clientId === parseInt(formData.clientId))
      : cases;

    if (!caseSearchTerm) return casesToSearch.slice(0, 10);

    const searchLower = caseSearchTerm.toLowerCase();
    return casesToSearch.filter(caseItem => {
      const displayName = `${caseItem.caseNumber} - ${caseItem.title}`;
      return displayName.toLowerCase().includes(searchLower);
    }).slice(0, 10);
  }, [cases, caseSearchTerm, formData.clientId]);

  const handleClientSearch = (e) => {
    const value = e.target.value;
    setClientSearchTerm(value);
    setShowClientDropdown(true);

    if (!value) {
      setFormData({ ...formData, clientId: "", caseId: "" });
      setCaseSearchTerm("");
    }
  };

  const handleClientSelect = (client) => {
    const displayName = client.type === "company"
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;
    setClientSearchTerm(displayName);
    setFormData({ ...formData, clientId: client.id, caseId: "" });
    setCaseSearchTerm("");
    setShowClientDropdown(false);
  };

  const handleCaseSearch = (e) => {
    const value = e.target.value;
    setCaseSearchTerm(value);
    setShowCaseDropdown(true);

    if (!value) {
      setFormData({ ...formData, caseId: "" });
    }
  };

  const handleCaseSelect = (caseItem) => {
    const displayName = `${caseItem.caseNumber} - ${caseItem.title}`;
    setCaseSearchTerm(displayName);
    setFormData({ ...formData, caseId: caseItem.id });
    setShowCaseDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {appointment ? "تعديل موعد" : "إضافة موعد جديد"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
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
              <div className="form-group" style={{ position: 'relative' }} ref={clientDropdownRef}>
                <label className="form-label">الموكل</label>
                <input
                  type="text"
                  className="form-control"
                  value={clientSearchTerm}
                  onChange={handleClientSearch}
                  onFocus={() => setShowClientDropdown(true)}
                  placeholder="ابحث عن الموكل..."
                  autoComplete="off"
                />
                {showClientDropdown && filteredClients.length > 0 && (
                  <div
                    className="client-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="client-dropdown-item"
                        onClick={() => handleClientSelect(client)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        {client.type === "company"
                          ? client.companyName
                          : `${client.firstName} ${client.lastName}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group" style={{ position: 'relative' }} ref={caseDropdownRef}>
                <label className="form-label">القضية</label>
                <input
                  type="text"
                  className="form-control"
                  value={caseSearchTerm}
                  onChange={handleCaseSearch}
                  onFocus={() => formData.clientId && setShowCaseDropdown(true)}
                  placeholder={formData.clientId ? "ابحث عن القضية..." : "اختر الموكل أولاً"}
                  disabled={!formData.clientId}
                  autoComplete="off"
                />
                {showCaseDropdown && formData.clientId && filteredCasesForSearch.length > 0 && (
                  <div
                    className="case-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {filteredCasesForSearch.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        className="case-dropdown-item"
                        onClick={() => handleCaseSelect(caseItem)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        {caseItem.caseNumber} - {caseItem.title}
                      </div>
                    ))}
                  </div>
                )}
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
                value={formData.notes || ""}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {appointment ? "حفظ التعديلات" : "إضافة موعد"}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Set default date filters: today and one week ahead
  const getDefaultDateFrom = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultDateTo = () => {
    const oneWeekAhead = new Date();
    oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);
    return oneWeekAhead.toISOString().split('T')[0];
  };

  const [filterDateFrom, setFilterDateFrom] = useState(getDefaultDateFrom());
  const [filterDateTo, setFilterDateTo] = useState(getDefaultDateTo());
  const confirm = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [appointmentsResult, clientsResult] = await Promise.all([
      appointmentAPI.getAll(),
      clientAPI.getAll(),
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
        showSuccess(
          selectedAppointment
            ? "تم تحديث بيانات الموعد بنجاح"
            : "تم إضافة الموعد بنجاح",
        );
      } else {
        showError("خطأ: " + result.error);
      }
    } catch (error) {
      showError("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا الموعد؟",
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
    });

    if (confirmed) {
      const result = await appointmentAPI.delete(id);
      if (result.success) {
        loadData();
        showSuccess("تم حذف الموعد بنجاح");
      } else {
        showError("خطأ: " + result.error);
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

  const handleExportExcel = () => {
    try {
      const dataToExport = formatAppointmentsForExcel(filteredAppointments);
      exportToExcel(dataToExport, 'قائمة_المواعيد', 'المواعيد');
      showSuccess('تم تصدير البيانات إلى Excel بنجاح');
    } catch (error) {
      showError('فشل تصدير البيانات إلى Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const formattedData = formatAppointmentsForPDF(filteredAppointments);

      // Define custom column widths for better display
      const columnWidths = {
        'العنوان': '18%',
        'الموكل': '16%',
        'التاريخ': '12%',
        'الوقت': '9%',
        'المدة (دقيقة)': '9%',
        'المكان': '20%',
        'الحالة': '16%',
      };

      const columns = formattedData.length > 0 ? Object.keys(formattedData[0]).map(key => ({
        key,
        label: key,
        width: columnWidths[key] || `${100 / Object.keys(formattedData[0]).length}%`
      })) : [];

      const pdfDoc = (
        <PDFListDocument
          title="قائمة المواعيد"
          subtitle={`عدد المواعيد: ${filteredAppointments.length}`}
          columns={columns}
          data={formattedData}
        />
      );

      await exportToPDF(pdfDoc, 'قائمة_المواعيد');
      showSuccess('تم تصدير البيانات إلى PDF بنجاح');
    } catch (error) {
      showError('فشل تصدير البيانات إلى PDF');
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return "-";
    return client.type === "company"
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const globalFilterFn = (appointment, searchTerm) => {
    return (
      appointment.title.includes(searchTerm) ||
      (appointment.location && appointment.location.includes(searchTerm)) ||
      (appointment.clientId &&
        getClientName(appointment.clientId).includes(searchTerm))
    );
  };

  // Filter appointments to show only today and future appointments, with optional date range
  const filteredAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);

      // Filter by date range (default to today and after)
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (appointmentDate < fromDate) return false;
      } else {
        // Default: only show today and future appointments
        if (appointmentDate < today) return false;
      }

      if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (appointmentDate > toDate) return false;
      }

      return true;
    });

    // Sort by date ascending (earliest first)
    return filtered.sort((a, b) => {
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    });
  }, [appointments, filterDateFrom, filterDateTo]);

  const filteredByType = useMemo(() => {
    if (filterType === "all") return filteredAppointments;
    return filteredAppointments.filter((a) => a.appointmentType === filterType);
  }, [filteredAppointments, filterType]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "appointmentDate",
        header: "التاريخ والوقت",
        cell: ({ row }) => formatDateTime(row.original.appointmentDate),
        enableSorting: true,
      },
      {
        accessorKey: "title",
        header: "العنوان",
        enableSorting: true,
      },
      {
        accessorKey: "clientId",
        header: "الموكل",
        cell: ({ row }) =>
          row.original.clientId ? getClientName(row.original.clientId) : "-",
        enableSorting: false,
      },
      {
        accessorKey: "appointmentType",
        header: "النوع",
        cell: ({ row }) => (
          <span className="badge badge-primary">
            {getAppointmentTypeLabel(row.original.appointmentType)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "duration",
        header: "المدة",
        cell: ({ row }) => `${row.original.duration} دقيقة`,
        enableSorting: true,
      },
      {
        accessorKey: "location",
        header: "الموقع",
        cell: ({ row }) => row.original.location || "-",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.status === "scheduled"
                ? "badge-warning"
                : row.original.status === "completed"
                  ? "badge-success"
                  : row.original.status === "cancelled"
                    ? "badge-danger"
                    : "badge-info"
            }`}
          >
            {getStatusLabel(row.original.status)}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleEdit(row.original)}
            >
              ✏️ تعديل
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(row.original.id)}
            >
              🗑️ حذف
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [clients],
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">إدارة المواعيد</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-success"
            onClick={handleExportExcel}
            title="تصدير إلى Excel"
          >
            📊 Excel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleExportPDF}
            title="تصدير إلى PDF"
          >
            📄 PDF
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ إضافة موعد جديد
          </button>
        </div>
      </div>

      <div className="card">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 البحث عن موعد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: "180px" }}
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
            style={{ width: "180px" }}
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

        <div className="search-container" style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label style={{ whiteSpace: "nowrap" }}>من تاريخ:</label>
            <input
              type="date"
              className="form-control"
              style={{ width: "180px" }}
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
            <label style={{ whiteSpace: "nowrap" }}>إلى تاريخ:</label>
            <input
              type="date"
              className="form-control"
              style={{ width: "180px" }}
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
            <button
              className="btn btn-outline"
              onClick={() => {
                setFilterDateFrom(getDefaultDateFrom());
                setFilterDateTo(getDefaultDateTo());
              }}
            >
              أسبوع من اليوم
            </button>
          </div>
        </div>

        <DataTable
          data={filteredByType}
          columns={columns}
          searchTerm={searchTerm}
          filterValue={filterStatus}
          filterKey="status"
          globalFilterFn={globalFilterFn}
          pageSize={10}
          showPagination={true}
          emptyMessage={
            searchTerm || filterStatus !== "all" || filterType !== "all"
              ? "لم يتم العثور على مواعيد مطابقة للبحث"
              : "لم يتم إضافة أي مواعيد بعد"
          }
        />
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
