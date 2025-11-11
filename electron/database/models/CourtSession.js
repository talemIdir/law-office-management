import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

// Court Session Model - نموذج الجلسة
const CourtSession = sequelize.define('CourtSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'تاريخ ووقت الجلسة'
  },
  sessionType: {
    type: DataTypes.ENUM('hearing', 'verdict', 'procedural', 'other'),
    defaultValue: 'hearing',
    comment: 'نوع الجلسة'
  },
  court: {
    type: DataTypes.STRING,
    comment: 'المحكمة'
  },
  courtRoom: {
    type: DataTypes.STRING,
    comment: 'قاعة الجلسة'
  },
  judge: {
    type: DataTypes.STRING,
    comment: 'القاضي'
  },
  attendees: {
    type: DataTypes.TEXT,
    comment: 'الحاضرون'
  },
  outcome: {
    type: DataTypes.TEXT,
    comment: 'نتيجة الجلسة'
  },
  nextSessionDate: {
    type: DataTypes.DATE,
    comment: 'موعد الجلسة القادمة'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'postponed', 'cancelled'),
    defaultValue: 'scheduled',
    comment: 'حالة الجلسة'
  }
}, {
  timestamps: true,
  tableName: 'court_sessions'
});

export default CourtSession;
