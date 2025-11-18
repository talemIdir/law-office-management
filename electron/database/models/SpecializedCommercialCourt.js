import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const SpecializedCommercialCourt = sequelize.define('SpecializedCommercialCourt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'اسم المحكمة التجارية المتخصصة'
  },
  jurisdictionDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'تفاصيل الاختصاص الترابي'
  }
}, {
  tableName: 'specialized_commercial_courts',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
});

export default SpecializedCommercialCourt;
