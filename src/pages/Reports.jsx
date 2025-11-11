import React, { useState, useEffect, useMemo } from "react";
import { getFinancialReport, caseAPI, clientAPI } from "../utils/api";
import { showError, showWarning } from "../utils/toast";
import DataTable from "../components/DataTable";

function ReportsPage() {
  const [reportType, setReportType] = useState("financial");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
    loadData();
  }, []);

  const loadData = async () => {
    const [casesResult, clientsResult] = await Promise.all([
      caseAPI.getAll(),
      clientAPI.getAll(),
    ]);
    if (casesResult.success) setCases(casesResult.data);
    if (clientsResult.success) setClients(clientsResult.data);
  };

  const generateFinancialReport = async () => {
    setLoading(true);
    const result = await getFinancialReport(startDate, endDate);
    if (result.success) {
      setReportData(result.data);
    } else {
      showError("خطأ: " + result.error);
    }
    setLoading(false);
  };

  const generateCaseReport = () => {
    setLoading(true);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredCases = cases.filter((c) => {
      const caseDate = new Date(c.startDate || c.createdAt);
      return caseDate >= start && caseDate <= end;
    });

    const casesByType = {};
    const casesByStatus = {};

    filteredCases.forEach((c) => {
      casesByType[c.caseType] = (casesByType[c.caseType] || 0) + 1;
      casesByStatus[c.status] = (casesByStatus[c.status] || 0) + 1;
    });

    setReportData({
      totalCases: filteredCases.length,
      casesByType,
      casesByStatus,
      cases: filteredCases,
    });

    setLoading(false);
  };

  const generateClientReport = () => {
    setLoading(true);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredClients = clients.filter((c) => {
      const clientDate = new Date(c.createdAt);
      return clientDate >= start && clientDate <= end;
    });

    const clientsByType = {
      individual: filteredClients.filter((c) => c.type === "individual").length,
      company: filteredClients.filter((c) => c.type === "company").length,
    };

    const clientsByStatus = {};
    filteredClients.forEach((c) => {
      clientsByStatus[c.status] = (clientsByStatus[c.status] || 0) + 1;
    });

    setReportData({
      totalClients: filteredClients.length,
      clientsByType,
      clientsByStatus,
      clients: filteredClients,
    });

    setLoading(false);
  };

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      showWarning("الرجاء اختيار تاريخ البداية والنهاية");
      return;
    }

    if (reportType === "financial") {
      generateFinancialReport();
    } else if (reportType === "cases") {
      generateCaseReport();
    } else if (reportType === "clients") {
      generateClientReport();
    }
  };

  const formatCurrency = (amount) => {
    return (
      new Intl.NumberFormat("ar-DZ", {
        style: "decimal",
        minimumFractionDigits: 2,
      }).format(amount || 0) + " دج"
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ar-DZ");
  };

  const translateCaseType = (type) => {
    const types = {
      civil: "مدني",
      criminal: "جنائي",
      commercial: "تجاري",
      administrative: "إداري",
      family: "أسري",
      labor: "عمالي",
      other: "أخرى",
    };
    return types[type] || type;
  };

  const translateCaseStatus = (status) => {
    const statuses = {
      open: "مفتوحة",
      in_progress: "قيد المعالجة",
      won: "كسب",
      lost: "خسارة",
      settled: "تسوية",
      closed: "مغلقة",
      appealed: "استئناف",
    };
    return statuses[status] || status;
  };

  const translateClientStatus = (status) => {
    const statuses = {
      active: "نشط",
      inactive: "غير نشط",
      archived: "مؤرشف",
    };
    return statuses[status] || status;
  };

  // Column definitions for invoices table
  const invoicesColumns = useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "رقم الفاتورة",
        enableSorting: true,
      },
      {
        accessorKey: "invoiceDate",
        header: "التاريخ",
        cell: ({ row }) => formatDate(row.original.invoiceDate),
        enableSorting: true,
      },
      {
        accessorKey: "totalAmount",
        header: "المبلغ",
        cell: ({ row }) => formatCurrency(row.original.totalAmount),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.status === "paid" ? "badge-success" : "badge-warning"
            }`}
          >
            {row.original.status === "paid" ? "مدفوعة" : "غير مدفوعة"}
          </span>
        ),
        enableSorting: true,
      },
    ],
    [],
  );

  // Column definitions for cases by type table
  const casesByTypeColumns = useMemo(
    () => [
      {
        accessorKey: "type",
        header: "نوع القضية",
        cell: ({ row }) => translateCaseType(row.original.type),
        enableSorting: true,
      },
      {
        accessorKey: "count",
        header: "العدد",
        cell: ({ row }) => <strong>{row.original.count}</strong>,
        enableSorting: true,
      },
    ],
    [],
  );

  // Column definitions for cases by status table
  const casesByStatusColumns = useMemo(
    () => [
      {
        accessorKey: "status",
        header: "حالة القضية",
        cell: ({ row }) => translateCaseStatus(row.original.status),
        enableSorting: true,
      },
      {
        accessorKey: "count",
        header: "العدد",
        cell: ({ row }) => <strong>{row.original.count}</strong>,
        enableSorting: true,
      },
    ],
    [],
  );

  // Column definitions for clients by status table
  const clientsByStatusColumns = useMemo(
    () => [
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => translateClientStatus(row.original.status),
        enableSorting: true,
      },
      {
        accessorKey: "count",
        header: "العدد",
        cell: ({ row }) => <strong>{row.original.count}</strong>,
        enableSorting: true,
      },
    ],
    [],
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">التقارير والإحصائيات</h1>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "1.5rem" }}>إنشاء تقرير</h3>

        <div className="form-row" style={{ marginBottom: "1.5rem" }}>
          <div className="form-group">
            <label className="form-label">نوع التقرير</label>
            <select
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="financial">التقرير المالي</option>
              <option value="cases">تقرير القضايا</option>
              <option value="clients">تقرير الموكلين</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">من تاريخ</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">إلى تاريخ</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? "جاري إنشاء التقرير..." : "📊 إنشاء التقرير"}
        </button>
      </div>

      {reportData && reportType === "financial" && (
        <>
          <div className="stats-grid">
            <div className="stat-card success">
              <div className="stat-card-header">
                <span className="stat-card-title">إجمالي الفواتير</span>
                <span className="stat-card-icon">💵</span>
              </div>
              <div className="stat-card-value">
                {formatCurrency(reportData.totalInvoiced)}
              </div>
              <div className="stat-card-description">
                عدد الفواتير: {reportData.invoices.length}
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-card-header">
                <span className="stat-card-title">إجمالي المدفوعات</span>
                <span className="stat-card-icon">💰</span>
              </div>
              <div className="stat-card-value">
                {formatCurrency(reportData.totalPaid)}
              </div>
              <div className="stat-card-description">
                عدد الدفعات: {reportData.payments.length}
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-card-header">
                <span className="stat-card-title">إجمالي المصروفات</span>
                <span className="stat-card-icon">💳</span>
              </div>
              <div className="stat-card-value">
                {formatCurrency(reportData.totalExpenses)}
              </div>
              <div className="stat-card-description">
                عدد المصروفات: {reportData.expenses.length}
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-card-header">
                <span className="stat-card-title">صافي الدخل</span>
                <span className="stat-card-icon">📈</span>
              </div>
              <div className="stat-card-value">
                {formatCurrency(reportData.netIncome)}
              </div>
              <div className="stat-card-description">
                {reportData.netIncome >= 0 ? "ربح" : "خسارة"}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">تفاصيل الفواتير</h3>
            <DataTable
              data={reportData.invoices}
              columns={invoicesColumns}
              showPagination={true}
              pageSize={10}
              emptyMessage="لا توجد فواتير في هذه الفترة"
            />
          </div>
        </>
      )}

      {reportData && reportType === "cases" && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">إجمالي القضايا</span>
                <span className="stat-card-icon">⚖️</span>
              </div>
              <div className="stat-card-value">{reportData.totalCases}</div>
              <div className="stat-card-description">في الفترة المحددة</div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">القضايا حسب النوع</h3>
            <DataTable
              data={Object.entries(reportData.casesByType).map(
                ([type, count]) => ({ type, count }),
              )}
              columns={casesByTypeColumns}
              showPagination={false}
              emptyMessage="لا توجد بيانات"
            />
          </div>

          <div className="card">
            <h3 className="card-title">القضايا حسب الحالة</h3>
            <DataTable
              data={Object.entries(reportData.casesByStatus).map(
                ([status, count]) => ({ status, count }),
              )}
              columns={casesByStatusColumns}
              showPagination={false}
              emptyMessage="لا توجد بيانات"
            />
          </div>
        </>
      )}

      {reportData && reportType === "clients" && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">إجمالي الموكلين</span>
                <span className="stat-card-icon">👥</span>
              </div>
              <div className="stat-card-value">{reportData.totalClients}</div>
              <div className="stat-card-description">في الفترة المحددة</div>
            </div>

            <div className="stat-card info">
              <div className="stat-card-header">
                <span className="stat-card-title">أفراد</span>
                <span className="stat-card-icon">👤</span>
              </div>
              <div className="stat-card-value">
                {reportData.clientsByType.individual}
              </div>
              <div className="stat-card-description">موكلين أفراد</div>
            </div>

            <div className="stat-card success">
              <div className="stat-card-header">
                <span className="stat-card-title">شركات</span>
                <span className="stat-card-icon">🏢</span>
              </div>
              <div className="stat-card-value">
                {reportData.clientsByType.company}
              </div>
              <div className="stat-card-description">موكلين شركات</div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">الموكلين حسب الحالة</h3>
            <DataTable
              data={Object.entries(reportData.clientsByStatus).map(
                ([status, count]) => ({ status, count }),
              )}
              columns={clientsByStatusColumns}
              showPagination={false}
              emptyMessage="لا توجد بيانات"
            />
          </div>
        </>
      )}

      {!reportData && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p className="empty-state-title">لم يتم إنشاء تقرير بعد</p>
          <p className="empty-state-description">
            اختر نوع التقرير والفترة الزمنية ثم اضغط على "إنشاء التقرير"
          </p>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
