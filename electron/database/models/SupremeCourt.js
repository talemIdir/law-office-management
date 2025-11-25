import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

/**
 * SupremeCourt Model - المحكمة العليا
 * Represents the Supreme Court of Algeria
 */
const SupremeCourt = sequelize.define('SupremeCourt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'المحكمة العليا',
    comment: 'اسم المحكمة العليا'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'رقم الهاتف'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'البريد الإلكتروني'
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'الموقع الإلكتروني'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'العنوان'
  },
  receptionDays: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'أيام الاستقبال'
  }
}, {
  tableName: 'supreme_court',
  timestamps: false
});

export default SupremeCourt;
