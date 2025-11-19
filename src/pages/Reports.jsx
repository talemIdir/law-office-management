import React, { useState, useEffect, useMemo } from "react";
import { caseAPI, clientAPI, paymentAPI, expenseAPI } from "../utils/api";
import { showError, showWarning } from "../utils/toast";
import DataTable from "../components/DataTable";
import AdvancedFilter from "../components/AdvancedFilter";
import {
  getCaseTypeLabel,
  getPaymentMethodLabel,
  getStatusLabel,
  getExpenseCategoryLabel,
} from "../utils/labels";

function ReportsPage() {
  const [reportType, setReportType] = useState("financial");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [paymentFilters, setPaymentFilters] = useState({});
  const [expenseFilters, setExpenseFilters] = useState({});
  const [caseFilters, setCaseFilters] = useState({});

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

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Get all cases, payments, and expenses
      const [casesResult, paymentsResult, expensesResult] = await Promise.all([
        caseAPI.getAll(),
        paymentAPI.getAll(),
        expenseAPI.getAll(),
      ]);

      if (
        !casesResult.success ||
        !paymentsResult.success ||
        !expensesResult.success
      ) {
        showError("خطأ في تحميل البيانات");
        setLoading(false);
        return;
      }

      // Filter cases within date range
      const filteredCases = casesResult.data.filter((c) => {
        const caseDate = new Date(c.startDate || c.createdAt);
        return caseDate >= start && caseDate <= end;
      });

      // Filter payments within date range
      const filteredPayments = paymentsResult.data.filter((p) => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate >= start && paymentDate <= end;
      });

      // Filter expenses within date range
      const filteredExpenses = expensesResult.data.filter((e) => {
        const expenseDate = new Date(e.expenseDate);
        return expenseDate >= start && expenseDate <= end;
      });

      // Calculate totals
      const totalCaseAmount = filteredCases.reduce(
        (sum, c) => sum + (parseFloat(c.amount) || 0),
        0
      );
      const totalPaid = filteredPayments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );
      const totalExpenses = filteredExpenses.reduce(
        (sum, e) => sum + (parseFloat(e.amount) || 0),
        0
      );
      const netIncome = totalPaid - totalExpenses;

      setReportData({
        totalCaseAmount,
        totalPaid,
        totalExpenses,
        netIncome,
        cases: filteredCases,
        payments: filteredPayments,
        expenses: filteredExpenses,
      });
    } catch (error) {
      showError("خطأ: " + error.message);
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

  // Filter payments in reports
  const filteredPayments = useMemo(() => {
    if (!reportData?.payments) return [];
    let filtered = [...reportData.payments];

    if (paymentFilters.searchTerm) {
      const searchLower = paymentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter((p) => p.reference?.toLowerCase().includes(searchLower));
    }

    if (paymentFilters.paymentMethod && paymentFilters.paymentMethod !== "all") {
      filtered = filtered.filter((p) => p.paymentMethod === paymentFilters.paymentMethod);
    }

    return filtered;
  }, [reportData?.payments, paymentFilters]);

  // Filter expenses in reports
  const filteredExpenses = useMemo(() => {
    if (!reportData?.expenses) return [];
    let filtered = [...reportData.expenses];

    if (expenseFilters.searchTerm) {
      const searchLower = expenseFilters.searchTerm.toLowerCase();
      filtered = filtered.filter((e) => e.description?.toLowerCase().includes(searchLower));
    }

    if (expenseFilters.category && expenseFilters.category !== "all") {
      filtered = filtered.filter((e) => e.category === expenseFilters.category);
    }

    return filtered;
  }, [reportData?.expenses, expenseFilters]);

  // Filter cases in reports
  const filteredReportCases = useMemo(() => {
    if (!reportData?.cases) return [];
    let filtered = [...reportData.cases];

    if (caseFilters.searchTerm) {
      const searchLower = caseFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.caseNumber?.toLowerCase().includes(searchLower) ||
          c.title?.toLowerCase().includes(searchLower)
      );
    }

    if (caseFilters.caseType && caseFilters.caseType !== "all") {
      filtered = filtered.filter((c) => c.caseType === caseFilters.caseType);
    }

    if (caseFilters.status && caseFilters.status !== "all") {
      filtered = filtered.filter((c) => c.status === caseFilters.status);
    }

    return filtered;
  }, [reportData?.cases, caseFilters]);

  // Column definitions for cases table
  const casesColumns = useMemo(
    () => [
      {
        accessorKey: "caseNumber",
        header: "رقم القضية",
        enableSorting: true,
      },
      {
        accessorKey: "title",
        header: "العنوان",
        enableSorting: true,
      },
      {
        accessorKey: "caseType",
        header: "النوع",
        cell: ({ row }) => getCaseTypeLabel(row.original.caseType),
        enableSorting: true,
      },
      {
        accessorKey: "amount",
        header: "المبلغ المتوقع",
        cell: ({ row }) => formatCurrency(row.original.amount),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span className="badge badge-info">
            {getStatusLabel(row.original.status)}
          </span>
        ),
        enableSorting: true,
      },
    ],
    []
  );

  // Column definitions for payments table
  const paymentsColumns = useMemo(
    () => [
      {
        accessorKey: "paymentDate",
        header: "التاريخ",
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
        cell: ({ row }) => getPaymentMethodLabel(row.original.paymentMethod),
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

  // Column definitions for expenses table
  const expensesColumns = useMemo(
    () => [
      {
        accessorKey: "expenseDate",
        header: "التاريخ",
        cell: ({ row }) => formatDate(row.original.expenseDate),
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
    ],
    []
  );

  // Column definitions for cases by type table
  const casesByTypeColumns = useMemo(
    () => [
      {
        accessorKey: "type",
        header: "نوع القضية",
        cell: ({ row }) => getCaseTypeLabel(row.original.type),
        enableSorting: true,
      },
      {
        accessorKey: "count",
        header: "العدد",
        cell: ({ row }) => <strong>{row.original.count}</strong>,
        enableSorting: true,
      },
    ],
    []
  );

  // Column definitions for cases by status table
  const casesByStatusColumns = useMemo(
    () => [
      {
        accessorKey: "status",
        header: "حالة القضية",
        cell: ({ row }) => getStatusLabel(row.original.status),
        enableSorting: true,
      },
      {
        accessorKey: "count",
        header: "العدد",
        cell: ({ row }) => <strong>{row.original.count}</strong>,
        enableSorting: true,
      },
    ],
    []
  );

  // Column definitions for clients by status table
  const clientsByStatusColumns = useMemo(
    () => [
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => getStatusLabel(row.original.status),
        enableSorting: true,
      },
      {
        accessorKey: "count",
        header: "العدد",
        cell: ({ row }) => <strong>{row.original.count}</strong>,
        enableSorting: true,
      },
    ],
    []
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
          <div className="report-stats-grid">
            <div className="stat-card info">
              <div className="stat-card-header">
                <span className="stat-card-title">مبالغ القضايا المتوقعة</span>
                <span className="stat-card-icon">⚖️</span>
              </div>
              <div className="stat-card-value">
                {formatCurrency(reportData.totalCaseAmount || 0)}
              </div>
              <div className="stat-card-description">
                عدد القضايا: {reportData.cases?.length || 0}
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-card-header">
                <span className="stat-card-title">إجمالي المدفوعات</span>
                <span className="stat-card-icon">💰</span>
              </div>
              <div className="stat-card-value">
                {formatCurrency(reportData.totalPaid || 0)}
              </div>
              <div className="stat-card-description">
                عدد الدفعات: {reportData.payments?.length || 0}
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-card-header">
                <span className="stat-card-title">إجمالي المصروفات</span>
                <span className="stat-card-icon">💳</span>
              </div>
              <div className="stat-card-value">
                {formatCurrency(reportData.totalExpenses || 0)}
              </div>
              <div className="stat-card-description">
                عدد المصروفات: {reportData.expenses?.length || 0}
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-card-header">
                <span className="stat-card-title">صافي الدخل</span>
                <span className="stat-card-icon">📈</span>
              </div>
              <div className="stat-card-value">
                {formatCurrency(reportData.netIncome || 0)}
              </div>
              <div className="stat-card-description">
                {(reportData.netIncome || 0) >= 0 ? "ربح" : "خسارة"}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">تفاصيل القضايا</h3>
            <AdvancedFilter
              onFilterChange={setCaseFilters}
              filterConfig={{
                searchPlaceholder: "🔍 البحث في القضايا...",
                showDateRange: false,
                showAmountRange: false,
                defaultValues: {
                  caseType: "all",
                  status: "all",
                },
                customFilters: [
                  {
                    name: "caseType",
                    label: "نوع القضية",
                    icon: "📋",
                    type: "select",
                    options: [
                      { value: "all", label: "جميع الأنواع" },
                      { value: "civil", label: "المدني" },
                      { value: "social", label: "الإجتماعي" },
                      { value: "real_estate", label: "العقاري" },
                      { value: "family", label: "شؤون الأسرة" },
                      { value: "commercial", label: "التجاري" },
                      { value: "maritime", label: "البحري" },
                      { value: "urgent", label: "الاستعجالي" },
                      { value: "misdemeanor", label: "الجنح" },
                      { value: "violations", label: "المخالفات" },
                      { value: "juveniles", label: "الأحداث" },
                      { value: "penalty_enforcement", label: "تطبيق العقوبات" },
                      { value: "other", label: "أخرى" },
                    ],
                  },
                  {
                    name: "status",
                    label: "الحالة",
                    icon: "📊",
                    type: "select",
                    options: [
                      { value: "all", label: "جميع الحالات" },
                      { value: "first_instance", label: "على مستوى الدرجة الأولى" },
                      { value: "in_settlement", label: "في إطار التسوية" },
                      { value: "closed", label: "مغلقة" },
                      { value: "in_appeal", label: "في الاستئناف" },
                      { value: "extraordinary_appeal", label: "طعن غير عادي" },
                    ],
                  },
                ],
              }}
            />
            <DataTable
              data={filteredReportCases}
              columns={casesColumns}
              showPagination={true}
              pageSize={10}
              emptyMessage="لا توجد قضايا في هذه الفترة"
            />
          </div>

          <div className="card">
            <h3 className="card-title">تفاصيل المدفوعات</h3>
            <AdvancedFilter
              onFilterChange={setPaymentFilters}
              filterConfig={{
                searchPlaceholder: "🔍 البحث برقم المرجع...",
                showDateRange: false,
                showAmountRange: false,
                defaultValues: {
                  paymentMethod: "all",
                },
                customFilters: [
                  {
                    name: "paymentMethod",
                    label: "طريقة الدفع",
                    icon: "💳",
                    type: "select",
                    options: [
                      { value: "all", label: "جميع الطرق" },
                      { value: "cash", label: "نقدي" },
                      { value: "check", label: "شيك" },
                      { value: "bank_transfer", label: "تحويل بنكي" },
                      { value: "other", label: "أخرى" },
                    ],
                  },
                ],
              }}
            />
            <DataTable
              data={filteredPayments}
              columns={paymentsColumns}
              showPagination={true}
              pageSize={10}
              emptyMessage="لا توجد مدفوعات في هذه الفترة"
            />
          </div>

          <div className="card">
            <h3 className="card-title">تفاصيل المصروفات</h3>
            <AdvancedFilter
              onFilterChange={setExpenseFilters}
              filterConfig={{
                searchPlaceholder: "🔍 البحث في الوصف...",
                showDateRange: false,
                showAmountRange: false,
                defaultValues: {
                  category: "all",
                },
                customFilters: [
                  {
                    name: "category",
                    label: "الفئة",
                    icon: "🏷️",
                    type: "select",
                    options: [
                      { value: "all", label: "جميع الفئات" },
                      { value: "office_rent", label: "إيجار المكتب" },
                      { value: "salaries", label: "رواتب" },
                      { value: "utilities", label: "فواتير" },
                      { value: "supplies", label: "مستلزمات" },
                      { value: "transportation", label: "تنقلات" },
                      { value: "legal_fees", label: "رسوم قانونية" },
                      { value: "other", label: "أخرى" },
                    ],
                  },
                ],
              }}
            />
            <DataTable
              data={filteredExpenses}
              columns={expensesColumns}
              showPagination={true}
              pageSize={10}
              emptyMessage="لا توجد مصروفات في هذه الفترة"
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
              <div className="stat-card-value">
                {reportData.totalCases || 0}
              </div>
              <div className="stat-card-description">في الفترة المحددة</div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">القضايا حسب النوع</h3>
            <DataTable
              data={
                reportData.casesByType
                  ? Object.entries(reportData.casesByType).map(
                      ([type, count]) => ({ type, count })
                    )
                  : []
              }
              columns={casesByTypeColumns}
              showPagination={false}
              emptyMessage="لا توجد بيانات"
            />
          </div>

          <div className="card">
            <h3 className="card-title">القضايا حسب الحالة</h3>
            <DataTable
              data={
                reportData.casesByStatus
                  ? Object.entries(reportData.casesByStatus).map(
                      ([status, count]) => ({ status, count })
                    )
                  : []
              }
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
              <div className="stat-card-value">
                {reportData.totalClients || 0}
              </div>
              <div className="stat-card-description">في الفترة المحددة</div>
            </div>

            <div className="stat-card info">
              <div className="stat-card-header">
                <span className="stat-card-title">أفراد</span>
                <span className="stat-card-icon">👤</span>
              </div>
              <div className="stat-card-value">
                {reportData.clientsByType?.individual || 0}
              </div>
              <div className="stat-card-description">موكلين أفراد</div>
            </div>

            <div className="stat-card success">
              <div className="stat-card-header">
                <span className="stat-card-title">شركات</span>
                <span className="stat-card-icon">🏢</span>
              </div>
              <div className="stat-card-value">
                {reportData.clientsByType?.company || 0}
              </div>
              <div className="stat-card-description">موكلين شركات</div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">الموكلين حسب الحالة</h3>
            <DataTable
              data={
                reportData.clientsByStatus
                  ? Object.entries(reportData.clientsByStatus).map(
                      ([status, count]) => ({ status, count })
                    )
                  : []
              }
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
