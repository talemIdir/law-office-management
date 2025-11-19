import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clientAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import AdvancedFilter from "../components/AdvancedFilter";
import { getStatusLabel, getClientTypeLabel } from "../utils/labels";

function ClientModal({ client, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type: "individual",
    firstName: "",
    lastName: "",
    companyName: "",
    nationalId: "",
    taxId: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    wilaya: "",
    notes: "",
    status: "active",
    ...client,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const wilayas = [
    "الجزائر",
    "وهران",
    "قسنطينة",
    "عنابة",
    "بليدة",
    "باتنة",
    "سطيف",
    "سيدي بلعباس",
    "بسكرة",
    "تبسة",
    "تلمسان",
    "بجاية",
    "جيجل",
    "سكيكدة",
    "تيارت",
    "بشار",
    "مستغانم",
    "المسيلة",
    "الشلف",
    "الأغواط",
    "غرداية",
    "ورقلة",
    "البويرة",
    "تيزي وزو",
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {client ? "تعديل بيانات موكل" : "إضافة موكل جديد"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required">نوع الموكل</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="individual">فرد</option>
                <option value="company">شركة</option>
              </select>
            </div>

            {formData.type === "individual" ? (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">الاسم الأول</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">اسم العائلة</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label required">اسم الشركة</label>
                <input
                  type="text"
                  name="companyName"
                  className="form-control"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">رقم البطاقة الوطنية</label>
                <input
                  type="text"
                  name="nationalId"
                  className="form-control"
                  value={formData.nationalId}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">الرقم الجبائي</label>
                <input
                  type="text"
                  name="taxId"
                  className="form-control"
                  value={formData.taxId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">العنوان</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">المدينة</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">الولاية</label>
                <select
                  name="wilaya"
                  className="form-select"
                  value={formData.wilaya}
                  onChange={handleChange}
                >
                  <option value="">اختر الولاية</option>
                  {wilayas.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes || ""}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">الحالة</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {client ? "حفظ التعديلات" : "إضافة موكل"}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filters, setFilters] = useState({});
  const confirm = useConfirm();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const result = await clientAPI.getAll();
    if (result.success) {
      setClients(result.data);
    }
    setLoading(false);
  };

  const handleSave = async (formData) => {
    try {
      let result;
      if (selectedClient) {
        result = await clientAPI.update(selectedClient.id, formData);
      } else {
        result = await clientAPI.create(formData);
      }

      if (result.success) {
        setShowModal(false);
        setSelectedClient(null);
        loadClients();
        showSuccess(
          selectedClient
            ? "تم تحديث بيانات الموكل بنجاح"
            : "تم إضافة الموكل بنجاح"
        );
      } else {
        showError("خطأ: " + result.error);
      }
    } catch (error) {
      showError("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا الموكل؟",
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
    });

    if (confirmed) {
      const result = await clientAPI.delete(id);
      if (result.success) {
        loadClients();
        showSuccess("تم حذف الموكل بنجاح");
      } else {
        showError("خطأ: " + result.error);
      }
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedClient(null);
    setShowModal(true);
  };

  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.firstName?.toLowerCase().includes(searchLower) ||
          c.lastName?.toLowerCase().includes(searchLower) ||
          c.companyName?.toLowerCase().includes(searchLower) ||
          c.phone?.includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.nationalId?.includes(searchLower)
      );
    }

    // Date range filter (creation date)
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((c) => {
        if (!c.createdAt) return false;
        return new Date(c.createdAt) >= startDate;
      });
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((c) => {
        if (!c.createdAt) return false;
        return new Date(c.createdAt) <= endDate;
      });
    }

    // Client type filter
    if (filters.clientType && filters.clientType !== "all") {
      filtered = filtered.filter((c) => c.type === filters.clientType);
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    return filtered;
  }, [clients, filters]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "الاسم",
        cell: ({ row }) =>
          row.original.type === "company"
            ? row.original.companyName
            : `${row.original.firstName} ${row.original.lastName}`,
        enableSorting: true,
      },
      {
        accessorKey: "type",
        header: "النوع",
        cell: ({ row }) => (
          <span className="badge badge-secondary">
            {getClientTypeLabel(row.original.type)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "phone",
        header: "رقم الهاتف",
        enableSorting: true,
      },
      {
        accessorKey: "email",
        header: "البريد الإلكتروني",
        cell: ({ row }) => row.original.email || "-",
        enableSorting: true,
      },
      {
        accessorKey: "wilaya",
        header: "الولاية",
        cell: ({ row }) => row.original.wilaya || "-",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.status === "active"
                ? "badge-success"
                : row.original.status === "inactive"
                  ? "badge-warning"
                  : "badge-secondary"
            }`}
          >
            {getStatusLabel(row.original.status)}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-info"
              onClick={() => navigate(`/clients/${row.original.id}`)}
            >
              👁️ عرض
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleEdit(row.original)}
            >
              ✏️ تعديل
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(row.original.id)}
            >
              🗑️ حذف
            </button>
          </div>
        ),
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

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">إدارة الموكلين</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة موكل جديد
        </button>
      </div>

      <div className="card">
        <AdvancedFilter
          onFilterChange={setFilters}
          filterConfig={{
            searchPlaceholder: "🔍 البحث عن موكل (الاسم، الهاتف، البريد، الرقم الوطني)...",
            showDateRange: true,
            showAmountRange: false,
            defaultValues: {
              clientType: "all",
              status: "all",
            },
            customFilters: [
              {
                name: "clientType",
                label: "نوع الموكل",
                icon: "👤",
                type: "select",
                options: [
                  { value: "all", label: "جميع الأنواع" },
                  { value: "individual", label: "فرد" },
                  { value: "company", label: "شركة" },
                ],
              },
              {
                name: "status",
                label: "حالة الموكل",
                icon: "📊",
                type: "select",
                options: [
                  { value: "all", label: "جميع الحالات" },
                  { value: "active", label: "نشط" },
                  { value: "inactive", label: "غير نشط" },
                  { value: "archived", label: "مؤرشف" },
                ],
              },
            ],
          }}
        />

        <DataTable
          data={filteredClients}
          columns={columns}
          pageSize={10}
          showPagination={true}
          emptyMessage={
            Object.keys(filters).length > 0
              ? "لم يتم العثور على موكلين مطابقين للبحث"
              : "لم يتم إضافة أي موكلين بعد"
          }
        />
      </div>

      {showModal && (
        <ClientModal
          client={selectedClient}
          onClose={() => {
            setShowModal(false);
            setSelectedClient(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ClientsPage;
