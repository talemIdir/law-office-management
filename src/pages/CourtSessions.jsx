import React, { useState, useEffect, useMemo } from "react";
import { courtSessionAPI, caseAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";

function CourtSessionModal({ session, onClose, onSave }) {
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    sessionDate: "",
    court: "",
    courtRoom: "",
    judge: "",
    attendees: "",
    outcome: "",
    nextSessionDate: "",
    notes: "",
    status: "في التقرير",
    caseId: "",
    ...session,
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    const result = await caseAPI.getAll({
      where: { status: ["open", "in_progress"] },
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
            {session ? "تعديل بيانات جلسة" : "إضافة جلسة جديدة"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الجهة القضائية</label>
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
              <label className="form-label">قاضي الجلسة</label>
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
                  <option value="في التقرير">في التقرير</option>
                  <option value="في المرافعة">في المرافعة</option>
                  <option value="لجواب الخصم">لجواب الخصم</option>
                  <option value="لجوابنا">لجوابنا</option>
                  <option value="في المداولة">في المداولة</option>
                  <option value="مؤجلة">مؤجلة</option>
                  <option value="جلسة المحاكمة">جلسة المحاكمة</option>
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
              {session ? "حفظ التعديلات" : "إضافة جلسة"}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const confirm = useConfirm();

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
        showSuccess(
          selectedSession
            ? "تم تحديث بيانات الجلسة بنجاح"
            : "تم إضافة الجلسة بنجاح",
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
      message: "هل أنت متأكد من حذف هذه الجلسة؟",
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
    });

    if (confirmed) {
      const result = await courtSessionAPI.delete(id);
      if (result.success) {
        loadSessions();
        showSuccess("تم حذف الجلسة بنجاح");
      } else {
        showError("خطأ: " + result.error);
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

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const globalFilterFn = (session, searchTerm) => {
    return (
      (session.court && session.court.includes(searchTerm)) ||
      (session.courtRoom && session.courtRoom.includes(searchTerm)) ||
      (session.judge && session.judge.includes(searchTerm)) ||
      (session.caseId && `#${session.caseId}`.includes(searchTerm))
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "sessionDate",
        header: "التاريخ والوقت",
        cell: ({ row }) => formatDateTime(row.original.sessionDate),
        enableSorting: true,
      },
      {
        accessorKey: "caseId",
        header: "رقم القضية",
        cell: ({ row }) =>
          row.original.caseId ? `#${row.original.caseId}` : "-",
        enableSorting: true,
      },
      {
        accessorKey: "court",
        header: "الجهة القضائية",
        cell: ({ row }) => row.original.court || "-",
        enableSorting: true,
      },
      {
        accessorKey: "courtRoom",
        header: "القاعة",
        cell: ({ row }) => row.original.courtRoom || "-",
        enableSorting: true,
      },
      {
        accessorKey: "judge",
        header: "قاضي الجلسة",
        cell: ({ row }) => row.original.judge || "-",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.status === "في التقرير"
                ? "badge-info"
                : row.original.status === "في المرافعة"
                  ? "badge-primary"
                  : row.original.status === "لجواب الخصم"
                    ? "badge-warning"
                    : row.original.status === "لجوابنا"
                      ? "badge-warning"
                      : row.original.status === "في المداولة"
                        ? "badge-info"
                        : row.original.status === "مؤجلة"
                          ? "badge-secondary"
                          : "badge-success"
            }`}
          >
            {row.original.status}
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
    [],
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
        <h1 className="page-title">إدارة الجلسات</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة جلسة جديدة
        </button>
      </div>

      <div className="card">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 البحث عن جلسة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="في التقرير">في التقرير</option>
            <option value="في المرافعة">في المرافعة</option>
            <option value="لجواب الخصم">لجواب الخصم</option>
            <option value="لجوابنا">لجوابنا</option>
            <option value="في المداولة">في المداولة</option>
            <option value="مؤجلة">مؤجلة</option>
            <option value="جلسة المحاكمة">جلسة المحاكمة</option>
          </select>
        </div>

        <DataTable
          data={sessions}
          columns={columns}
          searchTerm={searchTerm}
          filterValue={filterStatus}
          filterKey="status"
          globalFilterFn={globalFilterFn}
          pageSize={10}
          showPagination={true}
          emptyMessage={
            searchTerm || filterStatus !== "all"
              ? "لم يتم العثور على جلسات مطابقة للبحث"
              : "لم يتم إضافة أي جلسات بعد"
          }
        />
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
