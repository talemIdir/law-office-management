import React, { useState, useEffect, useMemo } from "react";
import { expenseAPI, caseAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import { formatDate, formatCurrency } from "../utils/formatters";
import {
  getExpenseCategoryLabel,
  getPaymentMethodLabel,
} from "../utils/labels";

function ExpenseModal({ expense, onClose, onSave }) {
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    expenseDate: "",
    category: "other",
    description: "",
    amount: "",
    paymentMethod: "cash",
    reference: "",
    notes: "",
    caseId: "",
    ...expense,
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    const result = await caseAPI.getAll();
    if (result.success) setCases(result.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {expense ? "تعديل بيانات مصروف" : "إضافة مصروف جديد"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">تاريخ المصروف</label>
                <input
                  type="date"
                  name="expenseDate"
                  className="form-control"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label required">المبلغ (دج)</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">الفئة</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="court_fees">رسوم المحكمة</option>
                  <option value="transportation">النقل</option>
                  <option value="documentation">التوثيق</option>
                  <option value="office_supplies">مستلزمات المكتب</option>
                  <option value="utilities">المرافق</option>
                  <option value="salaries">الرواتب</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">طريقة الدفع</label>
                <select
                  name="paymentMethod"
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="cash">نقدي</option>
                  <option value="check">شيك</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="credit_card">بطاقة ائتمان</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">الوصف</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description || ""}
                onChange={handleChange}
                rows="3"
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">القضية المرتبطة</label>
                <select
                  name="caseId"
                  className="form-select"
                  value={formData.caseId}
                  onChange={handleChange}
                >
                  <option value="">لا يوجد</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">المرجع</label>
                <input
                  type="text"
                  name="reference"
                  className="form-control"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="رقم المرجع أو الإيصال"
                />
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
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {expense ? "حفظ التعديلات" : "إضافة مصروف"}
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

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [stats, setStats] = useState({
    totalAmount: 0,
    byCategory: {},
  });
  const confirm = useConfirm();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    const result = await expenseAPI.getAll();
    if (result.success) {
      setExpenses(result.data);
      calculateStats(result.data);
    }
    setLoading(false);
  };

  const calculateStats = (expensesData) => {
    const totalAmount = expensesData.reduce(
      (sum, exp) => sum + parseFloat(exp.amount || 0),
      0
    );

    const byCategory = {
      court_fees: 0,
      transportation: 0,
      documentation: 0,
      office_supplies: 0,
      utilities: 0,
      salaries: 0,
      other: 0,
    };

    expensesData.forEach((exp) => {
      if (byCategory.hasOwnProperty(exp.category)) {
        byCategory[exp.category] += parseFloat(exp.amount || 0);
      }
    });

    setStats({ totalAmount, byCategory });
  };

  const handleSave = async (formData) => {
    try {
      let result;
      if (selectedExpense) {
        result = await expenseAPI.update(selectedExpense.id, formData);
      } else {
        result = await expenseAPI.create(formData);
      }

      if (result.success) {
        setShowModal(false);
        setSelectedExpense(null);
        loadExpenses();
        showSuccess(
          selectedExpense
            ? "تم تحديث بيانات المصروف بنجاح"
            : "تم إضافة المصروف بنجاح"
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
      message: "هل أنت متأكد من حذف هذا المصروف؟",
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
    });

    if (confirmed) {
      const result = await expenseAPI.delete(id);
      if (result.success) {
        loadExpenses();
        showSuccess("تم حذف المصروف بنجاح");
      } else {
        showError("خطأ: " + result.error);
      }
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedExpense(null);
    setShowModal(true);
  };

  const globalFilterFn = (expense, searchTerm) => {
    return (
      expense.description.includes(searchTerm) ||
      (expense.reference && expense.reference.includes(searchTerm)) ||
      (expense.notes && expense.notes.includes(searchTerm))
    );
  };

  const filteredByCategory = useMemo(() => {
    if (filterCategory === "all") return expenses;
    return expenses.filter((e) => e.category === filterCategory);
  }, [expenses, filterCategory]);

  const columns = useMemo(
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
        cell: ({ row }) => (
          <div
            style={{
              maxWidth: "300px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.original.description}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "amount",
        header: "المبلغ",
        cell: ({ row }) => (
          <span style={{ fontWeight: "bold", color: "#ef4444" }}>
            {formatCurrency(row.original.amount)}
          </span>
        ),
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
        accessorKey: "case",
        header: "القضية",
        cell: ({ row }) => {
          const caseData = row.original.case;
          return caseData ? `${caseData.caseNumber}` : "-";
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="action-buttons">
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
        <h1 className="page-title">إدارة المصروفات</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة مصروف جديد
        </button>
      </div>

      {/* Statistics Cards */}
      <div
        className="stats-grid"
        style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
      >
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-value">{expenses.length}</div>
            <div className="stat-label">إجمالي المصروفات</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value" style={{ color: "#ef4444" }}>
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="stat-label">المبلغ الإجمالي</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏛️</div>
          <div className="stat-content">
            <div className="stat-value">
              {formatCurrency(stats.byCategory.court_fees)}
            </div>
            <div className="stat-label">رسوم المحكمة</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-value">
              {formatCurrency(stats.byCategory.transportation)}
            </div>
            <div className="stat-label">النقل</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-value">
              {formatCurrency(stats.byCategory.documentation)}
            </div>
            <div className="stat-label">التوثيق</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <div className="stat-value">
              {formatCurrency(stats.byCategory.office_supplies)}
            </div>
            <div className="stat-label">مستلزمات المكتب</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 البحث عن مصروف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">جميع الفئات</option>
            <option value="court_fees">رسوم المحكمة</option>
            <option value="transportation">النقل</option>
            <option value="documentation">التوثيق</option>
            <option value="office_supplies">مستلزمات المكتب</option>
            <option value="utilities">المرافق</option>
            <option value="salaries">الرواتب</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        <DataTable
          data={filteredByCategory}
          columns={columns}
          searchTerm={searchTerm}
          filterValue=""
          filterKey=""
          globalFilterFn={globalFilterFn}
          pageSize={10}
          showPagination={true}
          emptyMessage={
            searchTerm || filterCategory !== "all"
              ? "لم يتم العثور على مصروفات مطابقة للبحث"
              : "لم يتم إضافة أي مصروفات بعد"
          }
        />
      </div>

      {showModal && (
        <ExpenseModal
          expense={selectedExpense}
          onClose={() => {
            setShowModal(false);
            setSelectedExpense(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ExpensesPage;
