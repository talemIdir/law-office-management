import React, { useState, useEffect, useMemo } from "react";
import { caseAPI, clientAPI, paymentAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import PaymentModal from "../components/PaymentModal";

function CaseModal({ caseData, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    caseNumber: "",
    title: "",
    description: "",
    caseType: "civil",
    court: "",
    courtType: "محكمة ابتدائية",
    judge: "",
    opposingParty: "",
    opposingLawyer: "",
    clientRole: "plaintiff",
    status: "open",
    priority: "medium",
    startDate: "",
    endDate: "",
    nextHearingDate: "",
    amount: "",
    notes: "",
    clientId: "",
    ...caseData,
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const result = await clientAPI.getAll({ where: { status: "active" } });
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
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px" }}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            {caseData ? "تعديل بيانات قضية" : "إضافة قضية جديدة"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
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
                      {client.type === "company"
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
              {caseData ? "حفظ التعديلات" : "إضافة قضية"}
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedCaseForPayment, setSelectedCaseForPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const confirm = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [casesResult, clientsResult] = await Promise.all([
      caseAPI.getAll(),
      clientAPI.getAll(),
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
        showSuccess(
          selectedCase
            ? "تم تحديث بيانات القضية بنجاح"
            : "تم إضافة القضية بنجاح"
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
      message: "هل أنت متأكد من حذف هذه القضية؟",
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
    });

    if (confirmed) {
      const result = await caseAPI.delete(id);
      if (result.success) {
        loadData();
        showSuccess("تم حذف القضية بنجاح");
      } else {
        showError("خطأ: " + result.error);
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

  const handleAddPayment = (caseId) => {
    setSelectedCaseForPayment(caseId);
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (formData) => {
    try {
      const result = await paymentAPI.create(formData);

      if (result.success) {
        setShowPaymentModal(false);
        setSelectedCaseForPayment(null);
        loadData();
        showSuccess("تم تسجيل الدفعة بنجاح");
      } else {
        showError("خطأ: " + result.error);
      }
    } catch (error) {
      showError("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return "-";
    return client.type === "company"
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ar-DZ");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return (
      new Intl.NumberFormat("ar-DZ", {
        style: "decimal",
        minimumFractionDigits: 2,
      }).format(amount) + " دج"
    );
  };

  const globalFilterFn = (caseItem, searchTerm) => {
    return (
      caseItem.caseNumber.includes(searchTerm) ||
      caseItem.title.includes(searchTerm) ||
      (caseItem.opposingParty && caseItem.opposingParty.includes(searchTerm))
    );
  };

  const filteredByType = useMemo(() => {
    if (filterType === "all") return cases;
    return cases.filter((c) => c.caseType === filterType);
  }, [cases, filterType]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "caseNumber",
        header: "رقم القضية",
        cell: ({ row }) => <strong>{row.original.caseNumber}</strong>,
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
        cell: ({ row }) => getClientName(row.original.clientId),
        enableSorting: false,
      },
      {
        accessorKey: "caseType",
        header: "النوع",
        cell: ({ row }) => (
          <span className="badge badge-secondary">
            {row.original.caseType === "civil" && "مدني"}
            {row.original.caseType === "criminal" && "جنائي"}
            {row.original.caseType === "commercial" && "تجاري"}
            {row.original.caseType === "administrative" && "إداري"}
            {row.original.caseType === "family" && "أسري"}
            {row.original.caseType === "labor" && "عمالي"}
            {row.original.caseType === "other" && "أخرى"}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "court",
        header: "المحكمة",
        cell: ({ row }) => row.original.court || "-",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.status === "won"
                ? "badge-success"
                : row.original.status === "lost"
                  ? "badge-danger"
                  : row.original.status === "in_progress"
                    ? "badge-info"
                    : row.original.status === "settled"
                      ? "badge-success"
                      : "badge-warning"
            }`}
          >
            {row.original.status === "open" && "مفتوحة"}
            {row.original.status === "in_progress" && "قيد المعالجة"}
            {row.original.status === "won" && "كسب"}
            {row.original.status === "lost" && "خسارة"}
            {row.original.status === "settled" && "تسوية"}
            {row.original.status === "closed" && "مغلقة"}
            {row.original.status === "appealed" && "استئناف"}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "priority",
        header: "الأولوية",
        cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.priority === "urgent"
                ? "badge-danger"
                : row.original.priority === "high"
                  ? "badge-warning"
                  : "badge-info"
            }`}
          >
            {row.original.priority === "low" && "منخفضة"}
            {row.original.priority === "medium" && "متوسطة"}
            {row.original.priority === "high" && "عالية"}
            {row.original.priority === "urgent" && "عاجلة"}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "amount",
        header: "المبلغ",
        cell: ({ row }) => formatCurrency(row.original.amount),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleAddPayment(row.original.id)}
            >
              💵 دفعة
            </button>
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
    [clients]
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
            style={{ width: "180px" }}
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
            style={{ width: "180px" }}
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
              ? "لم يتم العثور على قضايا مطابقة للبحث"
              : "لم يتم إضافة أي قضايا بعد"
          }
        />
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

      {showPaymentModal && (
        <PaymentModal
          caseId={selectedCaseForPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCaseForPayment(null);
          }}
          onSave={handleSavePayment}
        />
      )}
    </div>
  );
}

export default CasesPage;
