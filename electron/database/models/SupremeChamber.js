import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

/**
 * SupremeChamber Model - غرف المحكمة العليا
 * Represents the chambers of the Supreme Court
 */
const SupremeChamber = sequelize.define('SupremeChamber', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'اسم الغرفة'
  },
  chamberType: {
    type: DataTypes.ENUM(
      'civil',              // الغرفة المدنية
      'real_estate',        // الغرفة العقارية
      'family',             // غرفة شؤون الأسرة والمواريث
      'commercial',         // الغرفة التجارية والبحرية
      'social',             // الغرفة الاجتماعية
      'criminal',           // الغرفة الجنائية
      'misdemeanor'         // غرفة الجنح والمخالفات
    ),
    allowNull: false,
    comment: 'نوع الغرفة'
  },
  supremeCourtId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'supreme_court',
      key: 'id'
    },
    comment: 'معرف المحكمة العليا'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'وصف الغرفة'
  }
}, {
  tableName: 'supreme_chambers',
  timestamps: false,
  indexes: [
    {
      fields: ['supremeCourtId']
    },
    {
      unique: true,
      fields: ['chamberType', 'supremeCourtId']
    }
  ]
});

export default SupremeChamber;
