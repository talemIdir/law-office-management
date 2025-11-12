import React, { useState, useEffect, useMemo } from "react";
import { invoiceAPI, paymentAPI, clientAPI, caseAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import PaymentModal from "../components/PaymentModal";

function InvoiceModal({ invoice, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    description: "",
    amount: "",
    taxAmount: "0",
    totalAmount: "",
    status: "draft",
    notes: "",
    clientId: "",
    caseId: "",
    ...invoice,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const taxAmount = parseFloat(formData.taxAmount) || 0;
    setFormData((prev) => ({
      ...prev,
      totalAmount: (amount + taxAmount).toFixed(2),
    }));
  }, [formData.amount, formData.taxAmount]);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {invoice ? "تعديل فاتورة" : "إضافة فاتورة جديدة"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">رقم الفاتورة</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  className="form-control"
                  value={formData.invoiceNumber}
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
              <label className="form-label">القضية (اختياري)</label>
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">تاريخ الفاتورة</label>
                <input
                  type="date"
                  name="invoiceDate"
                  className="form-control"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">تاريخ الاستحقاق</label>
                <input
                  type="date"
                  name="dueDate"
                  className="form-control"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">وصف الخدمات</label>
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
                <label className="form-label required">المبلغ (دج)</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">الضريبة (دج)</label>
                <input
                  type="number"
                  name="taxAmount"
                  className="form-control"
                  value={formData.taxAmount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">المبلغ الإجمالي (دج)</label>
              <input
                type="number"
                name="totalAmount"
                className="form-control"
                value={formData.totalAmount}
                readOnly
                style={{ background: "#f5f5f5" }}
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
                <option value="draft">مسودة</option>
                <option value="sent">مرسلة</option>
                <option value="paid">مدفوعة</option>
                <option value="partially_paid">مدفوعة جزئياً</option>
                <option value="overdue">متأخرة</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {invoice ? "حفظ التعديلات" : "إضافة فاتورة"}
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

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const confirm = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [invoicesResult, clientsResult] = await Promise.all([
      invoiceAPI.getAll(),
      clientAPI.getAll(),
    ]);

    if (invoicesResult.success) setInvoices(invoicesResult.data);
    if (clientsResult.success) setClients(clientsResult.data);
    setLoading(false);
  };

  const handleSaveInvoice = async (formData) => {
    try {
      let result;
      if (selectedInvoice) {
        result = await invoiceAPI.update(selectedInvoice.id, formData);
      } else {
        result = await invoiceAPI.create(formData);
      }

      if (result.success) {
        setShowInvoiceModal(false);
        setSelectedInvoice(null);
        loadData();
        showSuccess(
          selectedInvoice
            ? "تم تحديث الفاتورة بنجاح"
            : "تم إضافة الفاتورة بنجاح",
        );
      } else {
        showError("خطأ: " + result.error);
      }
    } catch (error) {
      showError("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleSavePayment = async (formData) => {
    try {
      // Validate that if payment is from an invoice, that invoice has a caseId
      if (!formData.caseId) {
        showError("لا يمكن إضافة دفعة لفاتورة بدون قضية مرتبطة");
        return;
      }

      const result = await paymentAPI.create(formData);

      if (result.success) {
        setShowPaymentModal(false);
        setSelectedInvoiceForPayment(null);
        loadData();
        showSuccess("تم تسجيل الدفعة بنجاح");
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
      message: "هل أنت متأكد من حذف هذه الفاتورة؟",
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
    });

    if (confirmed) {
      const result = await invoiceAPI.delete(id);
      if (result.success) {
        loadData();
        showSuccess("تم حذف الفاتورة بنجاح");
      } else {
        showError("خطأ: " + result.error);
      }
    }
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleAdd = () => {
    setSelectedInvoice(null);
    setShowInvoiceModal(true);
  };

  const handleAddPayment = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setShowPaymentModal(true);
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return "-";
    return client.type === "company"
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ar-DZ");
  };

  const formatCurrency = (amount) => {
    return (
      new Intl.NumberFormat("ar-DZ", {
        style: "decimal",
        minimumFractionDigits: 2,
      }).format(amount) + " دج"
    );
  };

  const globalFilterFn = (invoice, searchTerm) => {
    return (
      invoice.invoiceNumber.includes(searchTerm) ||
      getClientName(invoice.clientId).includes(searchTerm) ||
      (invoice.description && invoice.description.includes(searchTerm))
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "رقم الفاتورة",
        cell: ({ row }) => <strong>{row.original.invoiceNumber}</strong>,
        enableSorting: true,
      },
      {
        accessorKey: "clientId",
        header: "الموكل",
        cell: ({ row }) => getClientName(row.original.clientId),
        enableSorting: false,
      },
      {
        accessorKey: "invoiceDate",
        header: "التاريخ",
        cell: ({ row }) => formatDate(row.original.invoiceDate),
        enableSorting: true,
      },
      {
        accessorKey: "totalAmount",
        header: "المبلغ الإجمالي",
        cell: ({ row }) => formatCurrency(row.original.totalAmount),
        enableSorting: true,
      },
      {
        accessorKey: "paidAmount",
        header: "المبلغ المدفوع",
        cell: ({ row }) => formatCurrency(row.original.paidAmount || 0),
        enableSorting: true,
      },
      {
        id: "remaining",
        header: "المتبقي",
        cell: ({ row }) => {
          const remaining =
            parseFloat(row.original.totalAmount) -
            parseFloat(row.original.paidAmount || 0);
          return formatCurrency(remaining);
        },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.status === "paid"
                ? "badge-success"
                : row.original.status === "overdue"
                  ? "badge-danger"
                  : row.original.status === "partially_paid"
                    ? "badge-warning"
                    : row.original.status === "sent"
                      ? "badge-info"
                      : "badge-secondary"
            }`}
          >
            {row.original.status === "draft" && "مسودة"}
            {row.original.status === "sent" && "مرسلة"}
            {row.original.status === "paid" && "مدفوعة"}
            {row.original.status === "partially_paid" && "مدفوعة جزئياً"}
            {row.original.status === "overdue" && "متأخرة"}
            {row.original.status === "cancelled" && "ملغاة"}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="action-buttons">
            {row.original.status !== "paid" &&
              row.original.status !== "cancelled" && (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleAddPayment(row.original)}
                  disabled={!row.original.caseId}
                  title={!row.original.caseId ? "يجب ربط الفاتورة بقضية أولاً" : ""}
                >
                  💵 دفعة
                </button>
              )}
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
        <h1 className="page-title">إدارة الفواتير والمدفوعات</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة فاتورة جديدة
        </button>
      </div>

      <div className="card">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 البحث عن فاتورة..."
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
            <option value="draft">مسودة</option>
            <option value="sent">مرسلة</option>
            <option value="paid">مدفوعة</option>
            <option value="partially_paid">مدفوعة جزئياً</option>
            <option value="overdue">متأخرة</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>

        <DataTable
          data={invoices}
          columns={columns}
          searchTerm={searchTerm}
          filterValue={filterStatus}
          filterKey="status"
          globalFilterFn={globalFilterFn}
          pageSize={10}
          showPagination={true}
          emptyMessage={
            searchTerm || filterStatus !== "all"
              ? "لم يتم العثور على فواتير مطابقة للبحث"
              : "لم يتم إضافة أي فواتير بعد"
          }
        />
      </div>

      {showInvoiceModal && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedInvoice(null);
          }}
          onSave={handleSaveInvoice}
        />
      )}

      {showPaymentModal && selectedInvoiceForPayment && (
        <PaymentModal
          caseId={selectedInvoiceForPayment.caseId}
          invoiceId={selectedInvoiceForPayment.id}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoiceForPayment(null);
          }}
          onSave={handleSavePayment}
        />
      )}
    </div>
  );
}

export default InvoicesPage;
