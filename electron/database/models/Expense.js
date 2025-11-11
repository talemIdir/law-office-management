import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

// Expense Model - نموذج المصروف
const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'تاريخ المصروف'
  },
  category: {
    type: DataTypes.ENUM('court_fees', 'transportation', 'documentation', 'office_supplies', 'utilities', 'salaries', 'other'),
    allowNull: false,
    comment: 'فئة المصروف'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'الوصف'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'المبلغ (دج)'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'check', 'bank_transfer', 'credit_card', 'other'),
    comment: 'طريقة الدفع'
  },
  reference: {
    type: DataTypes.STRING,
    comment: 'المرجع'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  }
}, {
  timestamps: true,
  tableName: 'expenses'
});

export default Expense;
