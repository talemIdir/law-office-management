import React from "react";
import {
  createHashRouter,
  RouterProvider,
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfirmDialogProvider } from "./components/ConfirmDialog";
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/Clients";
import ViewClient from "./pages/ViewClient";
import CasesPage from "./pages/Cases";
import ViewCase from "./pages/ViewCase";
import CourtSessionsPage from "./pages/CourtSessions";
import DocumentsPage from "./pages/Documents";
import InvoicesPage from "./pages/Invoices";
import ExpensesPage from "./pages/Expenses";
import AppointmentsPage from "./pages/Appointments";
import ReportsPage from "./pages/Reports";
import ElectronicLitigationPage from "./pages/ElectronicLitigation";
import ElectronicServicesPage from "./pages/ElectronicServices";
import SettingsPage from "./pages/Settings";

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "لوحة التحكم", icon: "📊" },
    { path: "/clients", label: "الموكلين", icon: "👥" },
    { path: "/cases", label: "القضايا", icon: "⚖️" },
    { path: "/court-sessions", label: "الجلسات", icon: "🏛️" },
    { path: "/documents", label: "المستندات", icon: "📁" },
    { path: "/invoices", label: "الفواتير والمدفوعات", icon: "💰" },
    { path: "/expenses", label: "المصروفات", icon: "💸" },
    { path: "/appointments", label: "المواعيد", icon: "📅" },
    { path: "/reports", label: "التقارير", icon: "📈" },
    { path: "/electronic-litigation", label: "التقاضي الإلكتروني", icon: "⚡" },
    { path: "/electronic-services", label: "الخدمات الإلكترونية", icon: "🌐" },
    { path: "/settings", label: "الإعدادات", icon: "⚙️" },
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
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Layout() {
  return (
    <ConfirmDialogProvider>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Outlet />
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
  );
}

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "clients",
        element: <ClientsPage />,
      },
      {
        path: "clients/:id",
        element: <ViewClient />,
      },
      {
        path: "cases",
        element: <CasesPage />,
      },
      {
        path: "cases/:id",
        element: <ViewCase />,
      },
      {
        path: "court-sessions",
        element: <CourtSessionsPage />,
      },
      {
        path: "documents",
        element: <DocumentsPage />,
      },
      {
        path: "invoices",
        element: <InvoicesPage />,
      },
      {
        path: "expenses",
        element: <ExpensesPage />,
      },
      {
        path: "appointments",
        element: <AppointmentsPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "electronic-litigation",
        element: <ElectronicLitigationPage />,
      },
      {
        path: "electronic-services",
        element: <ElectronicServicesPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
