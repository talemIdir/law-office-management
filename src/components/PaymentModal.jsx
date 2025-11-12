import React, { useState, useEffect } from "react";
import { invoiceAPI } from "../utils/api";

function PaymentModal({ caseId, invoiceId, onClose, onSave }) {
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    paymentMethod: "cash",
    reference: "",
    notes: "",
    caseId: caseId,
    invoiceId: invoiceId || "",
  });

  useEffect(() => {
    if (caseId) {
      loadCaseInvoices();
    }
  }, [caseId]);

  const loadCaseInvoices = async () => {
    // Load invoices for this case so user can optionally link payment to an invoice
    const result = await invoiceAPI.getAll();
    if (result.success) {
      const caseInvoices = result.data.filter((inv) => inv.caseId === caseId);
      setInvoices(caseInvoices);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert empty string to null for optional invoiceId
    const dataToSave = {
      ...formData,
      invoiceId: formData.invoiceId || null,
    };
    onSave(dataToSave);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px" }}
      >
        <div className="modal-header">
          <h3 className="modal-title">إضافة دفعة</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">تاريخ الدفع</label>
                <input
                  type="date"
                  name="paymentDate"
                  className="form-control"
                  value={formData.paymentDate}
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
                  required
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">طريقة الدفع</label>
              <select
                name="paymentMethod"
                className="form-select"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="cash">نقداً</option>
                <option value="check">شيك</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="credit_card">بطاقة ائتمان</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            {invoices.length > 0 && (
              <div className="form-group">
                <label className="form-label">ربط بفاتورة (اختياري)</label>
                <select
                  name="invoiceId"
                  className="form-select"
                  value={formData.invoiceId}
                  onChange={handleChange}
                >
                  <option value="">بدون فاتورة</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.totalAmount.toLocaleString()} دج
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">المرجع / رقم الشيك</label>
              <input
                type="text"
                name="reference"
                className="form-control"
                value={formData.reference}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              إضافة دفعة
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

export default PaymentModal;
