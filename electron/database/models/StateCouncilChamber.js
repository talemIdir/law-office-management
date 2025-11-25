import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

/**
 * StateCouncilChamber Model - غرف مجلس الدولة
 * Represents the chambers of the State Council
 */
const StateCouncilChamber = sequelize.define('StateCouncilChamber', {
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
      'chamber_1',      // الغرفة 1
      'chamber_2',      // الغرفة 2
      'chamber_3',      // الغرفة 3
      'chamber_4',      // الغرفة 4
      'urgent'          // الغرفة الاستعجالية
    ),
    allowNull: false,
    comment: 'نوع الغرفة'
  },
  stateCouncilId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'state_council',
      key: 'id'
    },
    comment: 'معرف مجلس الدولة'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'وصف الغرفة'
  }
}, {
  tableName: 'state_council_chambers',
  timestamps: false,
  indexes: [
    {
      fields: ['stateCouncilId']
    },
    {
      unique: true,
      fields: ['chamberType', 'stateCouncilId']
    }
  ]
});

export default StateCouncilChamber;
