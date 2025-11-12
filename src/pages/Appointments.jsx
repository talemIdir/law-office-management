import React, { useState, useEffect, useMemo } from "react";
import { appointmentAPI, clientAPI, caseAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import CalendarView from "../components/CalendarView";
import { getStatusLabel, getAppointmentTypeLabel } from "../utils/labels";

function AppointmentModal({ appointment, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
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

  const loadData = async () => {
    const [clientsResult, casesResult] = await Promise.all([
      clientAPI.getAll(),
      caseAPI.getAll(),
    ]);
    if (clientsResult.success) setClients(clientsResult.data);
    if (casesResult.success) setCases(casesResult.data);
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
                      {client.type === "company"
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
  const [viewMode, setViewMode] = useState("table"); // "table" or "calendar"
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

  // Handle calendar event click (edit appointment)
  const handleCalendarEventSelect = (appointment) => {
    handleEdit(appointment);
  };

  // Handle calendar slot click (create new appointment)
  const handleCalendarSlotSelect = (slotInfo) => {
    // Format the date for datetime-local input (YYYY-MM-DDThh:mm)
    const startDate = new Date(slotInfo.start);
    const formattedDate = startDate.toISOString().slice(0, 16);

    setSelectedAppointment({
      appointmentDate: formattedDate,
    });
    setShowModal(true);
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

  const filteredByType = useMemo(() => {
    if (filterType === "all") return appointments;
    return appointments.filter((a) => a.appointmentType === filterType);
  }, [appointments, filterType]);

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
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="btn-group">
            <button
              className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setViewMode("table")}
            >
              📋 جدول
            </button>
            <button
              className={`btn ${viewMode === "calendar" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setViewMode("calendar")}
            >
              📅 تقويم
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ إضافة موعد جديد
          </button>
        </div>
      </div>

      <div className="card">
        {viewMode === "table" ? (
          <>
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
          </>
        ) : (
          <CalendarView
            appointments={appointments}
            clients={clients}
            onSelectEvent={handleCalendarEventSelect}
            onSelectSlot={handleCalendarSlotSelect}
          />
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
