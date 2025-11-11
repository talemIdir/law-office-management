import React, { useState, useEffect } from 'react';
import { getDashboardStats, getUpcomingCourtSessions, getUpcomingAppointments } from '../utils/api';

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
            {upcomingSessions.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>القضية</th>
                      <th>الموكل</th>
                      <th>المحكمة</th>
                      <th>النوع</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingSessions.map((session) => (
                      <tr key={session.id}>
                        <td>{formatDateTime(session.sessionDate)}</td>
                        <td>{session.case?.title || '-'}</td>
                        <td>
                          {session.case?.client?.type === 'company'
                            ? session.case?.client?.companyName
                            : `${session.case?.client?.firstName} ${session.case?.client?.lastName}`}
                        </td>
                        <td>{session.court || '-'}</td>
                        <td>
                          <span className="badge badge-info">
                            {session.sessionType === 'hearing' && 'جلسة استماع'}
                            {session.sessionType === 'verdict' && 'جلسة حكم'}
                            {session.sessionType === 'procedural' && 'جلسة إجرائية'}
                            {session.sessionType === 'other' && 'أخرى'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-warning">
                            {session.status === 'scheduled' && 'مجدولة'}
                            {session.status === 'completed' && 'مكتملة'}
                            {session.status === 'postponed' && 'مؤجلة'}
                            {session.status === 'cancelled' && 'ملغاة'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🏛️</div>
                <p className="empty-state-title">لا توجد جلسات قادمة</p>
                <p className="empty-state-description">لم يتم جدولة أي جلسات محكمة</p>
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">المواعيد القادمة</h3>
            </div>
            {upcomingAppointments.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>العنوان</th>
                      <th>الموكل</th>
                      <th>القضية</th>
                      <th>النوع</th>
                      <th>الموقع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{formatDateTime(appointment.appointmentDate)}</td>
                        <td>{appointment.title}</td>
                        <td>
                          {appointment.client
                            ? appointment.client.type === 'company'
                              ? appointment.client.companyName
                              : `${appointment.client.firstName} ${appointment.client.lastName}`
                            : '-'}
                        </td>
                        <td>{appointment.case?.title || '-'}</td>
                        <td>
                          <span className="badge badge-primary">
                            {appointment.appointmentType === 'consultation' && 'استشارة'}
                            {appointment.appointmentType === 'meeting' && 'اجتماع'}
                            {appointment.appointmentType === 'court_session' && 'جلسة محكمة'}
                            {appointment.appointmentType === 'other' && 'أخرى'}
                          </span>
                        </td>
                        <td>{appointment.location || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <p className="empty-state-title">لا توجد مواعيد قادمة</p>
                <p className="empty-state-description">لم يتم تحديد أي مواعيد</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
