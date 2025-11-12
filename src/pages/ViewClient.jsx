import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clientAPI, caseAPI, paymentAPI } from "../utils/api";
import { showError } from "../utils/toast";
import DataTable from "../components/DataTable";

function ViewClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cases");

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Load client data
      const clientResult = await clientAPI.getById(id);
      if (clientResult.success) {
        setClient(clientResult.data);
      } else {
        showError("خطأ في تحميل بيانات الموكل");
        navigate("/clients");
        return;
      }

      // Load client's cases
      const casesResult = await caseAPI.getAll({
        where: { clientId: parseInt(id) },
        order: [["startDate", "DESC"]]
      });
      if (casesResult.success) {
        setCases(casesResult.data);
      }

      // Load payments for client's cases
      const caseIds = casesResult.data?.map(c => c.id) || [];
      if (caseIds.length > 0) {
        const paymentsResult = await paymentAPI.getAll({
          where: { caseId: caseIds },
          order: [["paymentDate", "DESC"]]
        });
        if (paymentsResult.success) {
          // Enhance payments with case information
          const paymentsWithCases = paymentsResult.data.map(payment => {
            const relatedCase = casesResult.data.find(c => c.id === payment.caseId);
            return {
              ...payment,
              caseNumber: relatedCase?.caseNumber,
              caseTitle: relatedCase?.title
            };
          });
          setPayments(paymentsWithCases);
        }
      }
    } catch (error) {
      showError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ar-DZ");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("ar-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
      case "open":
      case "won":
        return "badge-success";
      case "in_progress":
        return "badge-info";
      case "inactive":
      case "closed":
        return "badge-warning";
      case "lost":
      case "archived":
        return "badge-secondary";
      default:
        return "badge-secondary";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: "نشط",
      inactive: "غير نشط",
      archived: "مؤرشف",
      open: "مفتوحة",
      in_progress: "قيد المعالجة",
      won: "مكسوبة",
      lost: "مخسورة",
      settled: "مسوّاة",
      closed: "مغلقة",
      appealed: "مستأنفة"
    };
    return labels[status] || status;
  };

  const getCaseTypeLabel = (type) => {
    const types = {
      civil: "مدنية",
      criminal: "جنائية",
      commercial: "تجارية",
      administrative: "إدارية",
      family: "أسرية",
      labor: "عمالية",
      other: "أخرى"
    };
    return types[type] || type;
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: "نقدي",
      check: "شيك",
      bank_transfer: "تحويل بنكي",
      credit_card: "بطاقة ائتمان",
      other: "أخرى"
    };
    return methods[method] || method;
  };

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
        cell: ({ row }) => (
          <span className="badge badge-secondary">
            {getCaseTypeLabel(row.original.caseType)}
          </span>
        ),
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
        accessorKey: "court",
        header: "المحكمة",
        cell: ({ row }) => row.original.court || "-",
        enableSorting: true,
      },
      {
        accessorKey: "startDate",
        header: "تاريخ البدء",
        cell: ({ row }) => formatDate(row.original.startDate),
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

  const paymentsColumns = useMemo(
    () => [
      {
        accessorKey: "paymentDate",
        header: "تاريخ الدفع",
        cell: ({ row }) => formatDate(row.original.paymentDate),
        enableSorting: true,
      },
      {
        accessorKey: "caseNumber",
        header: "رقم القضية",
        cell: ({ row }) => row.original.caseNumber || "-",
        enableSorting: true,
      },
      {
        accessorKey: "caseTitle",
        header: "عنوان القضية",
        cell: ({ row }) => row.original.caseTitle || "-",
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="page-content">
        <div className="card">
          <p className="empty-message">لم يتم العثور على الموكل</p>
        </div>
      </div>
    );
  }

  const totalCasesAmount = cases.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const totalPaymentsAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">
          {client.type === "company"
            ? client.companyName
            : `${client.firstName} ${client.lastName}`}
        </h1>
        <button className="btn btn-outline" onClick={() => navigate("/clients")}>
          ← العودة إلى قائمة الموكلين
        </button>
      </div>

      {/* Client Details Card */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <h3>تفاصيل الموكل</h3>
          <span className={`badge ${getStatusBadgeClass(client.status)}`}>
            {getStatusLabel(client.status)}
          </span>
        </div>
        <div className="card-body">
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">النوع:</span>
              <span className="detail-value">
                {client.type === "individual" ? "فرد" : "شركة"}
              </span>
            </div>

            {client.type === "individual" ? (
              <>
                <div className="detail-item">
                  <span className="detail-label">الاسم الكامل:</span>
                  <span className="detail-value">
                    {client.firstName} {client.lastName}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">رقم البطاقة الوطنية:</span>
                  <span className="detail-value">{client.nationalId || "-"}</span>
                </div>
              </>
            ) : (
              <>
                <div className="detail-item">
                  <span className="detail-label">اسم الشركة:</span>
                  <span className="detail-value">{client.companyName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">الرقم الجبائي:</span>
                  <span className="detail-value">{client.taxId || "-"}</span>
                </div>
              </>
            )}

            <div className="detail-item">
              <span className="detail-label">رقم الهاتف:</span>
              <span className="detail-value">{client.phone}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">البريد الإلكتروني:</span>
              <span className="detail-value">{client.email || "-"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">العنوان:</span>
              <span className="detail-value">{client.address || "-"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">المدينة:</span>
              <span className="detail-value">{client.city || "-"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">الولاية:</span>
              <span className="detail-value">{client.wilaya || "-"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">تاريخ التسجيل:</span>
              <span className="detail-value">{formatDate(client.createdAt)}</span>
            </div>
          </div>

          {client.notes && (
            <div className="detail-item" style={{ marginTop: "20px" }}>
              <span className="detail-label">ملاحظات:</span>
              <p className="detail-value">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid" style={{ marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <div className="stat-value">{cases.length}</div>
            <div className="stat-label">إجمالي القضايا</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalCasesAmount)}</div>
            <div className="stat-label">قيمة القضايا</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-value">{payments.length}</div>
            <div className="stat-label">إجمالي المدفوعات</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalPaymentsAmount)}</div>
            <div className="stat-label">إجمالي المبالغ المدفوعة</div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="card">
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-button ${activeTab === "cases" ? "active" : ""}`}
              onClick={() => setActiveTab("cases")}
            >
              ⚖️ القضايا ({cases.length})
            </button>
            <button
              className={`tab-button ${activeTab === "payments" ? "active" : ""}`}
              onClick={() => setActiveTab("payments")}
            >
              💰 المدفوعات ({payments.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "cases" && (
              <DataTable
                data={cases}
                columns={casesColumns}
                pageSize={10}
                showPagination={true}
                emptyMessage="لا توجد قضايا لهذا الموكل"
              />
            )}

            {activeTab === "payments" && (
              <DataTable
                data={payments}
                columns={paymentsColumns}
                pageSize={10}
                showPagination={true}
                emptyMessage="لا توجد مدفوعات لهذا الموكل"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewClient;
