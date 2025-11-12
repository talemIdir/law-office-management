import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  caseAPI,
  clientAPI,
  paymentAPI,
  courtSessionAPI,
  appointmentAPI,
  documentAPI,
  expenseAPI,
  invoiceAPI,
} from "../utils/api";
import { showError } from "../utils/toast";
import DataTable from "../components/DataTable";
import {
  getStatusLabel,
  getCaseTypeLabel,
  getPaymentMethodLabel,
  getAppointmentTypeLabel,
  getDocumentTypeLabel,
  getPriorityLabel,
  getClientRoleLabel,
  getSessionTypeLabel,
  getExpenseCategoryLabel,
} from "../utils/labels";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatFileSize,
} from "../utils/formatters";
import { generateCasePDF } from "../utils/pdfGenerator.jsx";
import { showSuccess } from "../utils/toast";

function ViewCase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [courtSessions, setCourtSessions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadCaseData();
  }, [id]);

  const loadCaseData = async () => {
    setLoading(true);
    try {
      // Load case data
      const caseResult = await caseAPI.getById(id);
      if (caseResult.success) {
        setCaseData(caseResult.data.dataValues || caseResult.data);
        // Load client data
        const clientId = caseResult.data.dataValues.clientId;
        if (clientId) {
          const clientResult = await clientAPI.getById(clientId);

          if (clientResult.success) {
            setClient(clientResult.data.dataValues || clientResult.data);
          }
        }
      } else {
        showError("خطأ في تحميل بيانات القضية");
        navigate("/cases");
        return;
      }

      // Load all related data
      const [
        paymentsResult,
        courtSessionsResult,
        appointmentsResult,
        documentsResult,
        expensesResult,
        invoicesResult,
      ] = await Promise.all([
        paymentAPI.getAll({
          where: { caseId: parseInt(id) },
          order: [["paymentDate", "DESC"]],
        }),
        courtSessionAPI.getAll({
          where: { caseId: parseInt(id) },
          order: [["sessionDate", "DESC"]],
        }),
        appointmentAPI.getAll({
          where: { caseId: parseInt(id) },
          order: [["appointmentDate", "DESC"]],
        }),
        documentAPI.getAll({
          where: { caseId: parseInt(id) },
          order: [["uploadDate", "DESC"]],
        }),
        expenseAPI.getAll({
          where: { caseId: parseInt(id) },
          order: [["expenseDate", "DESC"]],
        }),
        invoiceAPI.getAll({
          where: { caseId: parseInt(id) },
          order: [["invoiceDate", "DESC"]],
        }),
      ]);

      if (paymentsResult.success) setPayments(paymentsResult.data);
      if (courtSessionsResult.success)
        setCourtSessions(courtSessionsResult.data);
      if (appointmentsResult.success) setAppointments(appointmentsResult.data);
      if (documentsResult.success) setDocuments(documentsResult.data);
      if (expensesResult.success) setExpenses(expensesResult.data);
      if (invoicesResult.success) setInvoices(invoicesResult.data);
    } catch (error) {
      showError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
      case "open":
      case "won":
      case "completed":
      case "paid":
        return "badge-success";
      case "in_progress":
      case "scheduled":
        return "badge-info";
      case "inactive":
      case "closed":
      case "postponed":
      case "rescheduled":
        return "badge-warning";
      case "lost":
      case "archived":
      case "cancelled":
        return "badge-secondary";
      case "settled":
        return "badge-primary";
      case "appealed":
        return "badge-info";
      case "pending":
        return "badge-warning";
      case "partial":
        return "badge-warning";
      case "overdue":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "badge-danger";
      case "high":
        return "badge-warning";
      case "medium":
        return "badge-info";
      case "low":
        return "badge-secondary";
      default:
        return "badge-secondary";
    }
  };

  const handleExportPDF = () => {
    try {
      generateCasePDF(caseData, client, courtSessions, payments);
    } catch (error) {
      showError("حدث خطأ أثناء تصدير ملف PDF");
      console.error("PDF generation error:", error);
    }
  };

  // Columns for Payments Tab
  const paymentsColumns = useMemo(
    () => [
      {
        accessorKey: "paymentDate",
        header: "تاريخ الدفع",
        cell: ({ row }) => formatDate(row.original.paymentDate),
        enableSorting: true,
      },
      {
        accessorKey: "amount",
        header: "المبلغ",
        cell: ({ row }) => formatCurrency(row.original.amount),
        enableSorting: true,
      },
      {
        accessorKey: "paymentMethod",
        header: "طريقة الدفع",
        cell: ({ row }) => (
          <span className="badge badge-info">
            {getPaymentMethodLabel(row.original.paymentMethod)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "reference",
        header: "المرجع",
        cell: ({ row }) => row.original.reference || "-",
        enableSorting: true,
      },
      {
        accessorKey: "notes",
        header: "ملاحظات",
        cell: ({ row }) => row.original.notes || "-",
        enableSorting: false,
      },
    ],
    []
  );

  // Columns for Court Sessions Tab
  const courtSessionsColumns = useMemo(
    () => [
      {
        accessorKey: "sessionDate",
        header: "تاريخ الجلسة",
        cell: ({ row }) => formatDateTime(row.original.sessionDate),
        enableSorting: true,
      },
      {
        accessorKey: "sessionType",
        header: "نوع الجلسة",
        cell: ({ row }) => (
          <span className="badge badge-info">
            {getSessionTypeLabel(row.original.sessionType)}
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
        accessorKey: "courtRoom",
        header: "القاعة",
        cell: ({ row }) => row.original.courtRoom || "-",
        enableSorting: true,
      },
      {
        accessorKey: "judge",
        header: "القاضي",
        cell: ({ row }) => row.original.judge || "-",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span className={`badge ${getStatusBadgeClass(row.original.status)}`}>
            {getStatusLabel(row.original.status)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "outcome",
        header: "النتيجة",
        cell: ({ row }) => row.original.outcome || "-",
        enableSorting: false,
      },
    ],
    []
  );

  // Columns for Appointments Tab
  const appointmentsColumns = useMemo(
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
        accessorKey: "appointmentType",
        header: "النوع",
        cell: ({ row }) => (
          <span className="badge badge-secondary">
            {getAppointmentTypeLabel(row.original.appointmentType)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "location",
        header: "الموقع",
        cell: ({ row }) => row.original.location || "-",
        enableSorting: true,
      },
      {
        accessorKey: "duration",
        header: "المدة",
        cell: ({ row }) =>
          row.original.duration ? `${row.original.duration} دقيقة` : "-",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span className={`badge ${getStatusBadgeClass(row.original.status)}`}>
            {getStatusLabel(row.original.status)}
          </span>
        ),
        enableSorting: true,
      },
    ],
    []
  );

  // Columns for Documents Tab
  const documentsColumns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "العنوان",
        enableSorting: true,
      },
      {
        accessorKey: "documentType",
        header: "النوع",
        cell: ({ row }) => (
          <span className="badge badge-secondary">
            {getDocumentTypeLabel(row.original.documentType)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "fileName",
        header: "اسم الملف",
        cell: ({ row }) => row.original.fileName || "-",
        enableSorting: true,
      },
      {
        accessorKey: "fileSize",
        header: "الحجم",
        cell: ({ row }) => formatFileSize(row.original.fileSize),
        enableSorting: true,
      },
      {
        accessorKey: "uploadDate",
        header: "تاريخ الرفع",
        cell: ({ row }) => formatDate(row.original.uploadDate),
        enableSorting: true,
      },
      {
        accessorKey: "description",
        header: "الوصف",
        cell: ({ row }) => row.original.description || "-",
        enableSorting: false,
      },
    ],
    []
  );

  // Columns for Expenses Tab
  const expensesColumns = useMemo(
    () => [
      {
        accessorKey: "expenseDate",
        header: "التاريخ",
        cell: ({ row }) => formatDate(row.original.expenseDate),
        enableSorting: true,
      },
      {
        accessorKey: "description",
        header: "الوصف",
        enableSorting: true,
      },
      {
        accessorKey: "amount",
        header: "المبلغ",
        cell: ({ row }) => formatCurrency(row.original.amount),
        enableSorting: true,
      },
      {
        accessorKey: "category",
        header: "الفئة",
        cell: ({ row }) => (
          <span className="badge badge-secondary">
            {getExpenseCategoryLabel(row.original.category)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "notes",
        header: "ملاحظات",
        cell: ({ row }) => row.original.notes || "-",
        enableSorting: false,
      },
    ],
    []
  );

  // Columns for Invoices Tab
  const invoicesColumns = useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "رقم الفاتورة",
        enableSorting: true,
      },
      {
        accessorKey: "invoiceDate",
        header: "تاريخ الإصدار",
        cell: ({ row }) => formatDate(row.original.invoiceDate),
        enableSorting: true,
      },
      {
        accessorKey: "dueDate",
        header: "تاريخ الاستحقاق",
        cell: ({ row }) => formatDate(row.original.dueDate),
        enableSorting: true,
      },
      {
        accessorKey: "totalAmount",
        header: "المبلغ الإجمالي",
        cell: ({ row }) => formatCurrency(row.original.totalAmount),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span className={`badge ${getStatusBadgeClass(row.original.status)}`}>
            {getStatusLabel(row.original.status)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "notes",
        header: "ملاحظات",
        cell: ({ row }) => row.original.notes || "-",
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

  if (!caseData) {
    return (
      <div className="page-content">
        <div className="card">
          <p className="empty-message">لم يتم العثور على القضية</p>
        </div>
      </div>
    );
  }

  const totalPayments = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  );
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0
  );
  const totalInvoices = invoices.reduce(
    (sum, i) => sum + (parseFloat(i.totalAmount) || 0),
    0
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{caseData.title}</h1>
          <p style={{ color: "#666", marginTop: "5px" }}>
            رقم القضية: {caseData.caseNumber}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn-primary"
            onClick={handleExportPDF}
            title="تصدير إلى PDF"
          >
            📄 تصدير PDF
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/cases")}
          >
            ← العودة إلى قائمة القضايا
          </button>
        </div>
      </div>

      {/* Case Details Card */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <h3>تفاصيل القضية</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className={`badge ${getStatusBadgeClass(caseData.status)}`}>
              {getStatusLabel(caseData.status)}
            </span>
            <span
              className={`badge ${getPriorityBadgeClass(caseData.priority)}`}
            >
              {getPriorityLabel(caseData.priority)}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">رقم القضية:</span>
              <span className="detail-value">{caseData.caseNumber}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">نوع القضية:</span>
              <span className="detail-value">
                {getCaseTypeLabel(caseData.caseType)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">الموكل:</span>
              <span className="detail-value">
                {client ? (
                  <span
                    style={{ color: "#0066cc", cursor: "pointer" }}
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    {client.type === "company"
                      ? client.companyName
                      : `${client.firstName} ${client.lastName}`}
                  </span>
                ) : (
                  "-"
                )}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">دور الموكل:</span>
              <span className="detail-value">
                {getClientRoleLabel(caseData.clientRole)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">المحكمة:</span>
              <span className="detail-value">{caseData.court || "-"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">نوع المحكمة:</span>
              <span className="detail-value">{caseData.courtType || "-"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">القاضي:</span>
              <span className="detail-value">{caseData.judge || "-"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">الطرف المقابل:</span>
              <span className="detail-value">
                {caseData.opposingParty || "-"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">محامي الطرف المقابل:</span>
              <span className="detail-value">
                {caseData.opposingLawyer || "-"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">تاريخ البدء:</span>
              <span className="detail-value">
                {formatDate(caseData.startDate)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">تاريخ الانتهاء:</span>
              <span className="detail-value">
                {formatDate(caseData.endDate)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">الجلسة القادمة:</span>
              <span className="detail-value">
                {formatDateTime(caseData.nextHearingDate)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">المبلغ المطالب به:</span>
              <span className="detail-value">
                {formatCurrency(caseData.amount)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">تاريخ التسجيل:</span>
              <span className="detail-value">
                {formatDate(caseData.createdAt)}
              </span>
            </div>
          </div>

          {caseData.description && (
            <div className="detail-item" style={{ marginTop: "20px" }}>
              <span className="detail-label">وصف القضية:</span>
              <p className="detail-value">{caseData.description}</p>
            </div>
          )}

          {caseData.notes && (
            <div className="detail-item" style={{ marginTop: "20px" }}>
              <span className="detail-label">ملاحظات:</span>
              <p className="detail-value">{caseData.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid" style={{ marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{payments.length}</div>
            <div className="stat-label">المدفوعات</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalPayments)}</div>
            <div className="stat-label">إجمالي المدفوعات</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏛️</div>
          <div className="stat-content">
            <div className="stat-value">{courtSessions.length}</div>
            <div className="stat-label">الجلسات</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{appointments.length}</div>
            <div className="stat-label">المواعيد</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-value">{documents.length}</div>
            <div className="stat-label">المستندات</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalExpenses)}</div>
            <div className="stat-label">المصروفات</div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="card">
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📋 نظرة عامة
            </button>
            <button
              className={`tab-button ${activeTab === "payments" ? "active" : ""}`}
              onClick={() => setActiveTab("payments")}
            >
              💰 المدفوعات ({payments.length})
            </button>
            <button
              className={`tab-button ${activeTab === "courtSessions" ? "active" : ""}`}
              onClick={() => setActiveTab("courtSessions")}
            >
              🏛️ الجلسات ({courtSessions.length})
            </button>
            <button
              className={`tab-button ${activeTab === "appointments" ? "active" : ""}`}
              onClick={() => setActiveTab("appointments")}
            >
              📅 المواعيد ({appointments.length})
            </button>
            <button
              className={`tab-button ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              📁 المستندات ({documents.length})
            </button>
            <button
              className={`tab-button ${activeTab === "expenses" ? "active" : ""}`}
              onClick={() => setActiveTab("expenses")}
            >
              💸 المصروفات ({expenses.length})
            </button>
            <button
              className={`tab-button ${activeTab === "invoices" ? "active" : ""}`}
              onClick={() => setActiveTab("invoices")}
            >
              🧾 الفواتير ({invoices.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "overview" && (
              <div style={{ padding: "20px" }}>
                <h3 style={{ marginBottom: "20px" }}>ملخص القضية</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">إجمالي المدفوعات:</span>
                    <span
                      className="detail-value"
                      style={{ color: "#10b981", fontWeight: "bold" }}
                    >
                      {formatCurrency(totalPayments)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">إجمالي المصروفات:</span>
                    <span
                      className="detail-value"
                      style={{ color: "#ef4444", fontWeight: "bold" }}
                    >
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">إجمالي الفواتير:</span>
                    <span
                      className="detail-value"
                      style={{ color: "#3b82f6", fontWeight: "bold" }}
                    >
                      {formatCurrency(totalInvoices)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">عدد الجلسات:</span>
                    <span className="detail-value">
                      {courtSessions.length} جلسة
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">عدد المواعيد:</span>
                    <span className="detail-value">
                      {appointments.length} موعد
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">عدد المستندات:</span>
                    <span className="detail-value">
                      {documents.length} مستند
                    </span>
                  </div>
                </div>

                {courtSessions.length > 0 && (
                  <div style={{ marginTop: "30px" }}>
                    <h4 style={{ marginBottom: "15px" }}>آخر الجلسات</h4>
                    <div style={{ maxHeight: "300px", overflow: "auto" }}>
                      {courtSessions.slice(0, 5).map((session) => (
                        <div
                          key={session.id}
                          style={{
                            padding: "15px",
                            marginBottom: "10px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <strong>
                              {formatDateTime(session.sessionDate)}
                            </strong>
                            <span
                              className={`badge ${getStatusBadgeClass(session.status)}`}
                            >
                              {getStatusLabel(session.status)}
                            </span>
                          </div>
                          <div style={{ fontSize: "14px", color: "#666" }}>
                            <div>
                              <strong>النوع:</strong>{" "}
                              {getSessionTypeLabel(session.sessionType)}
                            </div>
                            {session.court && (
                              <div>
                                <strong>المحكمة:</strong> {session.court}
                              </div>
                            )}
                            {session.outcome && (
                              <div>
                                <strong>النتيجة:</strong> {session.outcome}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <DataTable
                data={payments}
                columns={paymentsColumns}
                pageSize={10}
                showPagination={true}
                emptyMessage="لا توجد مدفوعات لهذه القضية"
              />
            )}

            {activeTab === "courtSessions" && (
              <DataTable
                data={courtSessions}
                columns={courtSessionsColumns}
                pageSize={10}
                showPagination={true}
                emptyMessage="لا توجد جلسات لهذه القضية"
              />
            )}

            {activeTab === "appointments" && (
              <DataTable
                data={appointments}
                columns={appointmentsColumns}
                pageSize={10}
                showPagination={true}
                emptyMessage="لا توجد مواعيد لهذه القضية"
              />
            )}

            {activeTab === "documents" && (
              <DataTable
                data={documents}
                columns={documentsColumns}
                pageSize={10}
                showPagination={true}
                emptyMessage="لا توجد مستندات لهذه القضية"
              />
            )}

            {activeTab === "expenses" && (
              <DataTable
                data={expenses}
                columns={expensesColumns}
                pageSize={10}
                showPagination={true}
                emptyMessage="لا توجد مصروفات لهذه القضية"
              />
            )}

            {activeTab === "invoices" && (
              <DataTable
                data={invoices}
                columns={invoicesColumns}
                pageSize={10}
                showPagination={true}
                emptyMessage="لا توجد فواتير لهذه القضية"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCase;
