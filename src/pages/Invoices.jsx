import React, { useState, useEffect, useMemo } from "react";
import { invoiceAPI, clientAPI, caseAPI, paymentAPI, settingAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import { generateInvoicePDF } from "../utils/pdf/index.jsx";

function InvoiceModal({ invoice, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    description: "",
    taxPercentage: "0",
    notes: "",
    clientId: "",
    caseId: "",
    ...invoice,
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
              <label className="form-label">وصف الخدمات</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description || ""}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">نسبة الضريبة (%)</label>
              <input
                type="number"
                name="taxPercentage"
                className="form-control"
                value={formData.taxPercentage}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes || ""}
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
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const confirm = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [invoicesResult, clientsResult, casesResult] = await Promise.all([
      invoiceAPI.getAll(),
      clientAPI.getAll(),
      caseAPI.getAll(),
    ]);

    if (invoicesResult.success) setInvoices(invoicesResult.data);
    if (clientsResult.success) setClients(clientsResult.data);
    if (casesResult.success) setCases(casesResult.data);
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

  const handleExportPDF = async (invoice) => {
    try {
      const client = clients.find((c) => c.id === invoice.clientId);
      const caseData = invoice.caseId
        ? cases.find((c) => c.id === invoice.caseId)
        : null;

      // Fetch payments for the case
      let payments = [];
      if (invoice.caseId) {
        const paymentsResult = await paymentAPI.getAll({
          where: { caseId: parseInt(invoice.caseId) },
        });
        if (paymentsResult.success) {
          payments = paymentsResult.data;
        }
      }

      // Fetch office logo from settings
      const settingsResult = await settingAPI.getAll();
      let officeLogo = null;

      if (settingsResult.success) {
        const logoSetting = settingsResult.data.find(s => s.key === "officeLogo");
        if (logoSetting && logoSetting.value) {
          officeLogo = logoSetting.value;
        }
      }

      await generateInvoicePDF(invoice, client, caseData, payments, officeLogo);
      showSuccess("تم تصدير الفاتورة إلى PDF بنجاح");
    } catch (error) {
      showError("حدث خطأ أثناء تصدير الفاتورة");
      console.error("PDF generation error:", error);
    }
  };

  const getCaseAmount = (caseId) => {
    const caseData = cases.find((c) => c.id === caseId);
    return caseData ? parseFloat(caseData.amount || 0) : 0;
  };

  const calculateTaxAmount = (amount, taxPercentage) => {
    return (amount * parseFloat(taxPercentage || 0)) / 100;
  };

  const calculateTotalAmount = (amount, taxPercentage) => {
    return amount + calculateTaxAmount(amount, taxPercentage);
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
        id: "caseNumber",
        header: "رقم القضية",
        cell: ({ row }) => {
          if (!row.original.caseId) return "-";
          const caseData = cases.find((c) => c.id === row.original.caseId);
          return caseData ? caseData.caseNumber : "-";
        },
        enableSorting: false,
      },
      {
        id: "amount",
        header: "المبلغ الأساسي",
        cell: ({ row }) => {
          const amount = getCaseAmount(row.original.caseId);
          return formatCurrency(amount);
        },
        enableSorting: false,
      },
      {
        accessorKey: "taxPercentage",
        header: "الضريبة",
        cell: ({ row }) => `${row.original.taxPercentage || 0}%`,
        enableSorting: true,
      },
      {
        id: "totalAmount",
        header: "المبلغ الإجمالي",
        cell: ({ row }) => {
          const amount = getCaseAmount(row.original.caseId);
          const total = calculateTotalAmount(amount, row.original.taxPercentage);
          return formatCurrency(total);
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleExportPDF(row.original)}
              title="تصدير إلى PDF"
            >
              📄 PDF
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
    </div>
  );
}

export default InvoicesPage;
