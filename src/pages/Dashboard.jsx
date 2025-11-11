import React, { useState, useEffect, useMemo } from 'react';
import { getDashboardStats, getUpcomingCourtSessions, getUpcomingAppointments } from '../utils/api';
import DataTable from '../components/DataTable';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, sessionsRes, appointmentsRes] = await Promise.all([
        getDashboardStats(),
        getUpcomingCourtSessions(5),
        getUpcomingAppointments(5)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (sessionsRes.success) setUpcomingSessions(sessionsRes.data);
      if (appointmentsRes.success) setUpcomingAppointments(appointmentsRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' دج';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Column definitions for court sessions table
  const courtSessionsColumns = useMemo(
    () => [
      {
        accessorKey: 'sessionDate',
        header: 'التاريخ',
        cell: ({ row }) => formatDateTime(row.original.sessionDate),
        enableSorting: true,
      },
      {
        accessorKey: 'case.title',
        header: 'القضية',
        cell: ({ row }) => row.original.case?.title || '-',
        enableSorting: false,
      },
      {
        accessorKey: 'case.client',
        header: 'الموكل',
        cell: ({ row }) => {
          const client = row.original.case?.client;
          if (!client) return '-';
          return client.type === 'company'
            ? client.companyName
            : `${client.firstName} ${client.lastName}`;
        },
        enableSorting: false,
      },
      {
        accessorKey: 'court',
        header: 'المحكمة',
        cell: ({ row }) => row.original.court || '-',
        enableSorting: true,
      },
      {
        accessorKey: 'sessionType',
        header: 'النوع',
        cell: ({ row }) => {
          const typeMap = {
            hearing: 'جلسة استماع',
            verdict: 'جلسة حكم',
            procedural: 'جلسة إجرائية',
            other: 'أخرى'
          };
          return <span className="badge badge-info">{typeMap[row.original.sessionType] || row.original.sessionType}</span>;
        },
        enableSorting: true,
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => {
          const statusMap = {
            scheduled: 'مجدولة',
            completed: 'مكتملة',
            postponed: 'مؤجلة',
            cancelled: 'ملغاة'
          };
          return <span className="badge badge-warning">{statusMap[row.original.status] || row.original.status}</span>;
        },
        enableSorting: true,
      },
    ],
    []
  );

  // Column definitions for appointments table
  const appointmentsColumns = useMemo(
    () => [
      {
        accessorKey: 'appointmentDate',
        header: 'التاريخ',
        cell: ({ row }) => formatDateTime(row.original.appointmentDate),
        enableSorting: true,
      },
      {
        accessorKey: 'title',
        header: 'العنوان',
        enableSorting: true,
      },
      {
        accessorKey: 'client',
        header: 'الموكل',
        cell: ({ row }) => {
          const client = row.original.client;
          if (!client) return '-';
          return client.type === 'company'
            ? client.companyName
            : `${client.firstName} ${client.lastName}`;
        },
        enableSorting: false,
      },
      {
        accessorKey: 'case.title',
        header: 'القضية',
        cell: ({ row }) => row.original.case?.title || '-',
        enableSorting: false,
      },
      {
        accessorKey: 'appointmentType',
        header: 'النوع',
        cell: ({ row }) => {
          const typeMap = {
            consultation: 'استشارة',
            meeting: 'اجتماع',
            court_session: 'جلسة محكمة',
            other: 'أخرى'
          };
          return <span className="badge badge-primary">{typeMap[row.original.appointmentType] || row.original.appointmentType}</span>;
        },
        enableSorting: true,
      },
      {
        accessorKey: 'location',
        header: 'الموقع',
        cell: ({ row }) => row.original.location || '-',
        enableSorting: true,
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
    <div>
      <div className="page-header">
        <h1 className="page-title">لوحة التحكم</h1>
        <p style={{ color: '#666', margin: 0 }}>
          {new Date().toLocaleDateString('ar-DZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {stats && (
        <>
          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">إجمالي الموكلين</span>
                <span className="stat-card-icon">👥</span>
              </div>
              <div className="stat-card-value">{stats.totalClients}</div>
              <div className="stat-card-description">
                منهم {stats.activeClients} موكل نشط
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-card-header">
                <span className="stat-card-title">القضايا النشطة</span>
                <span className="stat-card-icon">⚖️</span>
              </div>
              <div className="stat-card-value">{stats.activeCases}</div>
              <div className="stat-card-description">
                من إجمالي {stats.totalCases} قضية
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-card-header">
                <span className="stat-card-title">الجلسات القادمة</span>
                <span className="stat-card-icon">🏛️</span>
              </div>
              <div className="stat-card-value">{stats.upcomingSessions}</div>
              <div className="stat-card-description">جلسة مجدولة</div>
            </div>

            <div className="stat-card danger">
              <div className="stat-card-header">
                <span className="stat-card-title">فواتير غير مدفوعة</span>
                <span className="stat-card-icon">💰</span>
              </div>
              <div className="stat-card-value">{stats.unpaidInvoices}</div>
              <div className="stat-card-description">
                من إجمالي {stats.totalInvoices} فاتورة
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-card-header">
                <span className="stat-card-title">الإيرادات المحصلة</span>
                <span className="stat-card-icon">💵</span>
              </div>
              <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="stat-card-description">هذا الشهر</div>
            </div>

            <div className="stat-card warning">
              <div className="stat-card-header">
                <span className="stat-card-title">مستحقات معلقة</span>
                <span className="stat-card-icon">⏳</span>
              </div>
              <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                {formatCurrency(stats.pendingRevenue)}
              </div>
              <div className="stat-card-description">في انتظار الدفع</div>
            </div>
          </div>

          {/* Upcoming Court Sessions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">الجلسات القادمة</h3>
            </div>
            <DataTable
              data={upcomingSessions}
              columns={courtSessionsColumns}
              showPagination={false}
              emptyMessage="لا توجد جلسات قادمة"
            />
          </div>

          {/* Upcoming Appointments */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">المواعيد القادمة</h3>
            </div>
            <DataTable
              data={upcomingAppointments}
              columns={appointmentsColumns}
              showPagination={false}
              emptyMessage="لا توجد مواعيد قادمة"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
