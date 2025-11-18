import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const AdministrativeAppealCourt = sequelize.define('AdministrativeAppealCourt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'اسم محكمة الاستئناف الإدارية'
  }
}, {
  tableName: 'administrative_appeal_courts',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
});

export default AdministrativeAppealCourt;
