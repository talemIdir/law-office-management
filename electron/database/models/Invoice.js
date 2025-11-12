import { DataTypes } from "sequelize";
import { sequelize } from "../config.js";

// Invoice Model - نموذج الفاتورة
const Invoice = sequelize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: "رقم الفاتورة",
    },
    invoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "تاريخ الفاتورة",
    },
    description: {
      type: DataTypes.TEXT,
      comment: "الوصف",
    },
    taxPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: "نسبة الضريبة (%)",
    },
    notes: {
      type: DataTypes.TEXT,
      comment: "ملاحظات",
    },
  },
  {
    timestamps: true,
    tableName: "invoices",
  },
);

export default Invoice;
