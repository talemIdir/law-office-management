import React, { useState, useEffect, useMemo } from "react";
import {
  getDashboardStats,
  getUpcomingCourtSessions,
  getUpcomingAppointments,
  courtSessionAPI,
  appointmentAPI,
  clientAPI,
} from "../utils/api";
import DataTable from "../components/DataTable";
import CalendarView from "../components/CalendarView";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, allSessionsRes, allAppointmentsRes, clientsRes] =
        await Promise.all([
          getDashboardStats(),
          courtSessionAPI.getAll(),
          appointmentAPI.getAll(),
          clientAPI.getAll(),
        ]);

      if (statsRes.success) setStats(statsRes.data);
      if (allSessionsRes.success) setAllSessions(allSessionsRes.data);
      if (allAppointmentsRes.success)
        setAllAppointments(allAppointmentsRes.data);
      if (clientsRes.success) setClients(clientsRes.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return (
      new Intl.NumberFormat("ar-DZ", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + " دج"
    );
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
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">لوحة التحكم</h1>
        <p style={{ color: "#666", margin: 0 }}>
          {new Date().toLocaleDateString("ar-DZ", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {stats && (
        <>
          {/* Statistics Cards */}
          <div className="dashboard-stats-grid">
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
                <span className="stat-card-title">إجمالي الفواتير</span>
                <span className="stat-card-icon">🧾</span>
              </div>
              <div className="stat-card-value">{stats.totalInvoices}</div>
              <div className="stat-card-description">فاتورة مسجلة</div>
            </div>

            <div className="stat-card success">
              <div className="stat-card-header">
                <span className="stat-card-title">إجمالي المدفوعات</span>
                <span className="stat-card-icon">💵</span>
              </div>
              <div className="stat-card-value" style={{ fontSize: "1.5rem" }}>
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="stat-card-description">مجموع المبالغ المحصلة</div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">التقويم - الجلسات والمواعيد</h3>
            </div>
            <div style={{ padding: "1rem" }}>
              <CalendarView
                appointments={allAppointments}
                courtSessions={allSessions}
                clients={clients}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
