import React from "react";
import {
  createHashRouter,
  RouterProvider,
  Link,
  useLocation,
  Outlet,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfirmDialogProvider } from "./components/ConfirmDialog";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
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
import CourtsDirectory from "./pages/CourtsDirectory";
import UsersPage from "./pages/Users";
import SettingsPage from "./pages/Settings";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px"
      }}>
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Sidebar() {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const allNavItems = [
    { path: "/", label: "لوحة التحكم", icon: "📊", roles: ["admin", "secretary"] },
    { path: "/clients", label: "الموكلين", icon: "👥", roles: ["admin", "secretary"] },
    { path: "/cases", label: "القضايا", icon: "⚖️", roles: ["admin", "secretary"] },
    { path: "/court-sessions", label: "الجلسات", icon: "🏛️", roles: ["admin", "secretary"] },
    { path: "/documents", label: "المستندات", icon: "📁", roles: ["admin", "secretary"] },
    { path: "/invoices", label: "الفواتير والمدفوعات", icon: "💰", roles: ["admin"] },
    { path: "/expenses", label: "المصروفات", icon: "💸", roles: ["admin"] },
    { path: "/appointments", label: "المواعيد", icon: "📅", roles: ["admin", "secretary"] },
    { path: "/reports", label: "التقارير", icon: "📈", roles: ["admin"] },
    { path: "/electronic-litigation", label: "التقاضي الإلكتروني", icon: "⚡", roles: ["admin"] },
    { path: "/electronic-services", label: "الخدمات الإلكترونية", icon: "🌐", roles: ["admin"] },
    { path: "/courts-directory", label: "فهرس المحاكم", icon: "📖", roles: ["admin", "secretary"] },
    { path: "/users", label: "إدارة المستخدمين", icon: "👤", roles: ["admin"] },
    { path: "/settings", label: "الإعدادات", icon: "⚙️", roles: ["admin"] },
  ];

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item =>
    item.roles.includes(user?.role)
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>⚖️ مكتب المحاماة</h2>
        <p>نظام الإدارة المتكامل</p>
        {user && (
          <div className="user-info">
            <p style={{ fontSize: "14px", marginTop: "10px", opacity: 0.9 }}>
              {user.fullName}
            </p>
            <p style={{ fontSize: "12px", opacity: 0.7 }}>
              {user.role === "admin" ? "مدير النظام" : "سكرتيرة"}
            </p>
          </div>
        )}
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
        <button
          onClick={handleLogout}
          className="nav-item logout-button"
          style={{
            marginTop: "auto",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "right",
            width: "100%",
            padding: "15px 20px",
            color: "inherit",
            fontSize: "inherit"
          }}
        >
          <span className="nav-icon">🚪</span>
          تسجيل الخروج
        </button>
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
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
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
        path: "courts-directory",
        element: <CourtsDirectory />,
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
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
