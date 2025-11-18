import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const JudicialCouncil = sequelize.define('JudicialCouncil', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'اسم المجلس القضائي'
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
  tableName: 'judicial_councils',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
});

export default JudicialCouncil;
