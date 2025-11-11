import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ConfirmDialogProvider } from './components/ConfirmDialog';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/Clients';
import CasesPage from './pages/Cases';
import CourtSessionsPage from './pages/CourtSessions';
import DocumentsPage from './pages/Documents';
import InvoicesPage from './pages/Invoices';
import AppointmentsPage from './pages/Appointments';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'لوحة التحكم', icon: '📊' },
    { path: '/clients', label: 'الموكلين', icon: '👥' },
    { path: '/cases', label: 'القضايا', icon: '⚖️' },
    { path: '/court-sessions', label: 'الجلسات', icon: '🏛️' },
    { path: '/documents', label: 'المستندات', icon: '📁' },
    { path: '/invoices', label: 'الفواتير والمدفوعات', icon: '💰' },
    { path: '/appointments', label: 'المواعيد', icon: '📅' },
    { path: '/reports', label: 'التقارير', icon: '📈' },
    { path: '/settings', label: 'الإعدادات', icon: '⚙️' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>⚖️ مكتب المحاماة</h2>
        <p>نظام الإدارة المتكامل</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <ConfirmDialogProvider>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/court-sessions" element={<CourtSessionsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
        <ToastContainer
          position="top-left"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ConfirmDialogProvider>
    </HashRouter>
  );
}

export default App;
