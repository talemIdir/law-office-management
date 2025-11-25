import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

/**
 * StateCouncil Model - مجلس الدولة
 * Represents the State Council of Algeria (highest administrative court)
 */
const StateCouncil = sequelize.define('StateCouncil', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'مجلس الدولة',
    comment: 'اسم مجلس الدولة'
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
  tableName: 'state_council',
  timestamps: false
});

export default StateCouncil;
