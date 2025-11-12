import React, { useState } from "react";

function PaymentModal({ caseId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    paymentMethod: "cash",
    reference: "",
    notes: "",
    caseId: caseId,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
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
