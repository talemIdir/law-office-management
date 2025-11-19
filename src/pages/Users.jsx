import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { userAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    role: "secretary",
    status: "active",
  });

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await userAPI.getAll();
      if (result.success) {
        setUsers(result.data);
      } else {
        toast.error("فشل تحميل المستخدمين");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "",
        fullName: user.fullName,
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        fullName: "",
        email: "",
        phone: "",
        role: "secretary",
        status: "active",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.fullName) {
      toast.error("الرجاء ملء الحقول المطلوبة");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("كلمة المرور مطلوبة للمستخدم الجديد");
      return;
    }

    try {
      let result;
      const dataToSubmit = { ...formData };

      // Don't send password if it's empty during edit
      if (editingUser && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }

      if (editingUser) {
        result = await userAPI.update(editingUser.id, dataToSubmit);
      } else {
        result = await userAPI.create(dataToSubmit);
      }

      if (result.success) {
        toast.success(editingUser ? "تم تحديث المستخدم بنجاح" : "تم إضافة المستخدم بنجاح");
        handleCloseModal();
        loadUsers();
      } else {
        toast.error(result.error || "فشلت العملية");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ المستخدم");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      return;
    }

    try {
      const result = await userAPI.delete(id);
      if (result.success) {
        toast.success("تم حذف المستخدم بنجاح");
        loadUsers();
      } else {
        toast.error(result.error || "فشل حذف المستخدم");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف المستخدم");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      const result = await userAPI.update(user.id, { status: newStatus });
      if (result.success) {
        toast.success(`تم ${newStatus === "active" ? "تفعيل" : "تعطيل"} المستخدم بنجاح`);
        loadUsers();
      } else {
        toast.error(result.error || "فشلت العملية");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة المستخدم");
    }
  };

  if (!isAdmin()) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="page-container">جاري التحميل...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>إدارة المستخدمين</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + إضافة مستخدم جديد
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>الاسم الكامل</th>
              <th>اسم المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.username}</td>
                <td>{user.email || "-"}</td>
                <td>{user.phone || "-"}</td>
                <td>
                  <span className={`badge ${user.role === "admin" ? "badge-primary" : "badge-secondary"}`}>
                    {user.role === "admin" ? "مدير" : "سكرتيرة"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.status === "active" ? "badge-success" : "badge-danger"}`}>
                    {user.status === "active" ? "نشط" : "معطل"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleOpenModal(user)}
                      title="تعديل"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleToggleStatus(user)}
                      title={user.status === "active" ? "تعطيل" : "تفعيل"}
                    >
                      {user.status === "active" ? "🔒" : "🔓"}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(user.id)}
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="empty-state">
            <p>لا يوجد مستخدمين</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>الاسم الكامل *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>اسم المستخدم *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={editingUser}
                  />
                </div>

                <div className="form-group">
                  <label>كلمة المرور {!editingUser && "*"}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    placeholder={editingUser ? "اتركه فارغاً للإبقاء على كلمة المرور الحالية" : ""}
                  />
                </div>

                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>الدور *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="admin">مدير النظام</option>
                    <option value="secretary">سكرتيرة</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>الحالة *</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    required
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">معطل</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
