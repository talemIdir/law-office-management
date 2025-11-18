import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const FirstDegreeCourt = sequelize.define('FirstDegreeCourt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'اسم المحكمة'
  },
  councilId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'judicial_councils',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'معرف المجلس القضائي'
  },
  isBranch: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'هل هو فرع (ملحقة) أم محكمة'
  }
}, {
  tableName: 'first_degree_courts',
  timestamps: false,
  indexes: [
    {
      fields: ['councilId']
    },
    {
      fields: ['isBranch']
    }
  ]
});

export default FirstDegreeCourt;
