import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const AdministrativeCourt = sequelize.define('AdministrativeCourt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'اسم المحكمة الإدارية'
  },
  appealCourtId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'administrative_appeal_courts',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'معرف محكمة الاستئناف الإدارية'
  }
}, {
  tableName: 'administrative_courts',
  timestamps: false,
  indexes: [
    {
      fields: ['appealCourtId']
    }
  ]
});

export default AdministrativeCourt;
