import React, { useState, useEffect, useMemo, useRef } from "react";
import { courtSessionAPI, caseAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";

function CourtSessionModal({ session, onClose, onSave }) {
  const [cases, setCases] = useState([]);
  const [caseSearchTerm, setCaseSearchTerm] = useState("");
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const caseDropdownRef = useRef(null);

  // Format date for datetime-local input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Convert to local timezone and format as YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    sessionDate: "",
    court: "",
    courtRoom: "",
    judge: "",
    attendees: "",
    outcome: "",
    notes: "",
    status: "في التقرير",
    caseId: "",
    ...session,
    // Format the sessionDate after spreading session data
    sessionDate: session?.sessionDate ? formatDateForInput(session.sessionDate) : "",
  });

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    // Set initial search term when editing a session
    if (session && session.caseId && cases.length > 0) {
      const selectedCase = cases.find(c => c.id === session.caseId);
      if (selectedCase) {
        setCaseSearchTerm(`${selectedCase.caseNumber} - ${selectedCase.title}`);
      }
    }
  }, [session, cases]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (caseDropdownRef.current && !caseDropdownRef.current.contains(event.target)) {
        setShowCaseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadCases = async () => {
    const result = await caseAPI.getAll({
      where: { status: ["first_instance", "in_settlement", "in_appeal"] },
    });
    if (result.success) {
      setCases(result.data);
    }
  };

  const filteredCases = useMemo(() => {
    if (!caseSearchTerm) return cases.slice(0, 10); // Show first 10 cases when empty

    const searchLower = caseSearchTerm.toLowerCase();
    return cases.filter(caseItem => {
      const displayName = `${caseItem.caseNumber} - ${caseItem.title}`;
      return displayName.toLowerCase().includes(searchLower);
    }).slice(0, 10); // Show max 10 results
  }, [cases, caseSearchTerm]);

  const handleCaseSearch = (e) => {
    const value = e.target.value;
    setCaseSearchTerm(value);
    setShowCaseDropdown(true);

    // Clear caseId if search term is cleared
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
            <div className="form-group" style={{ position: 'relative' }} ref={caseDropdownRef}>
              <label className="form-label required">القضية</label>
              <input
                type="text"
                className="form-control"
                value={caseSearchTerm}
                onChange={handleCaseSearch}
                onFocus={() => setShowCaseDropdown(true)}
                placeholder="ابحث عن القضية..."
                required
                autoComplete="off"
              />
              {showCaseDropdown && filteredCases.length > 0 && (
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
                  {filteredCases.map((caseItem) => (
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
                value={formData.attendees || ""}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">نتيجة الجلسة</label>
              <textarea
                name="outcome"
                className="form-textarea"
                value={formData.outcome || ""}
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
                <option value="في التقرير">في التقرير</option>
                <option value="في المرافعة">في المرافعة</option>
                <option value="لجواب الخصم">لجواب الخصم</option>
                <option value="لجوابنا">لجوابنا</option>
                <option value="في المداولة">في المداولة</option>
                <option value="مؤجلة">مؤجلة</option>
                <option value="جلسة المحاكمة">جلسة المحاكمة</option>
              </select>
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

  // Set default date filters: today and one week ahead
  const getDefaultDateFrom = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getDefaultDateTo = () => {
    const oneWeekAhead = new Date();
    oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);
    return oneWeekAhead.toISOString().split("T")[0];
  };

  const [filterDateFrom, setFilterDateFrom] = useState(getDefaultDateFrom());
  const [filterDateTo, setFilterDateTo] = useState(getDefaultDateTo());
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
            : "تم إضافة الجلسة بنجاح"
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
      (session.case.caseNumber &&
        `#${session.case.caseNumber}`.includes(searchTerm))
    );
  };

  // Filter sessions to show only today and future sessions, with optional date range
  const filteredSessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = sessions.filter((session) => {
      const sessionDate = new Date(session.sessionDate);

      // Filter by date range (default to today and after)
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (sessionDate < fromDate) return false;
      } else {
        // Default: only show today and future sessions
        if (sessionDate < today) return false;
      }

      if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (sessionDate > toDate) return false;
      }

      return true;
    });

    // Sort by date ascending (earliest first)
    return filtered.sort((a, b) => {
      return new Date(a.sessionDate) - new Date(b.sessionDate);
    });
  }, [sessions, filterDateFrom, filterDateTo]);

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
          row.original.case.caseNumber
            ? `${row.original.case.caseNumber}`
            : "-",
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
    []
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
          data={filteredSessions}
          columns={columns}
          searchTerm={searchTerm}
          filterValue={filterStatus}
          filterKey="status"
          globalFilterFn={globalFilterFn}
          pageSize={10}
          showPagination={true}
          emptyMessage={
            searchTerm ||
            filterStatus !== "all" ||
            filterDateFrom ||
            filterDateTo
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
