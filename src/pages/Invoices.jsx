import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  invoiceAPI,
  clientAPI,
  caseAPI,
  paymentAPI,
  settingAPI,
} from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import { generateInvoicePDF } from "../utils/pdf/index.jsx";

function InvoiceModal({ invoice, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [caseSearchTerm, setCaseSearchTerm] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const clientDropdownRef = useRef(null);
  const caseDropdownRef = useRef(null);
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

  useEffect(() => {
    // Set initial search terms when editing
    if (invoice && invoice.clientId && clients.length > 0) {
      const selectedClient = clients.find(c => c.id === invoice.clientId);
      if (selectedClient) {
        const displayName = selectedClient.type === "company"
          ? selectedClient.companyName
          : `${selectedClient.firstName} ${selectedClient.lastName}`;
        setClientSearchTerm(displayName);
      }
    }
  }, [invoice, clients]);

  useEffect(() => {
    // Set initial case search term
    if (invoice && invoice.caseId && cases.length > 0) {
      const selectedCase = cases.find(c => c.id === invoice.caseId);
      if (selectedCase) {
        setCaseSearchTerm(`${selectedCase.caseNumber} - ${selectedCase.title}`);
      }
    }
  }, [invoice, cases]);

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
              <div className="form-group" style={{ position: 'relative' }} ref={clientDropdownRef}>
                <label className="form-label required">الموكل</label>
                <input
                  type="text"
                  className="form-control"
                  value={clientSearchTerm}
                  onChange={handleClientSearch}
                  onFocus={() => setShowClientDropdown(true)}
                  placeholder="ابحث عن الموكل..."
                  required
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
            </div>

            <div className="form-group" style={{ position: 'relative' }} ref={caseDropdownRef}>
              <label className="form-label">القضية (اختياري)</label>
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
            : "تم إضافة الفاتورة بنجاح"
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
        const logoSetting = settingsResult.data.find(
          (s) => s.key === "officeLogo"
        );
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
          const total = calculateTotalAmount(
            amount,
            row.original.taxPercentage
          );
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
        <h1 className="page-title">إدارة الفواتير</h1>
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
