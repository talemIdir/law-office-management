import { DataTypes } from "sequelize";
import { sequelize } from "../config.js";

// Payment Model - نموذج الدفعة
const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "تاريخ الدفع",
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: "المبلغ (دج)",
    },
    paymentMethod: {
      type: DataTypes.ENUM(
        "cash",
        "check",
        "bank_transfer",
        "credit_card",
        "other",
      ),
      allowNull: false,
      comment: "طريقة الدفع",
    },
    reference: {
      type: DataTypes.STRING,
      comment: "المرجع / رقم الشيك",
    },
    notes: {
      type: DataTypes.TEXT,
      comment: "ملاحظات",
    },
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "معرف القضية - Case ID",
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "معرف الفاتورة - Invoice ID (optional)",
    },
  },
  {
    timestamps: true,
    tableName: "payments",
  },
);

export default Payment;
