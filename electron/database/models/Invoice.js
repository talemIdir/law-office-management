import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

// Invoice Model - نموذج الفاتورة
const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'رقم الفاتورة'
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'تاريخ الفاتورة'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    comment: 'تاريخ الاستحقاق'
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'الوصف'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'المبلغ (دج)'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    comment: 'مبلغ الضريبة'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'المبلغ الإجمالي'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    comment: 'المبلغ المدفوع'
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'),
    defaultValue: 'draft',
    comment: 'حالة الفاتورة'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  }
}, {
  timestamps: true,
  tableName: 'invoices'
});

export default Invoice;
