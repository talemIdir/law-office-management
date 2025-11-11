import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

// Appointment Model - نموذج الموعد
const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'عنوان الموعد'
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'تاريخ ووقت الموعد'
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'المدة بالدقائق'
  },
  location: {
    type: DataTypes.STRING,
    comment: 'الموقع'
  },
  appointmentType: {
    type: DataTypes.ENUM('consultation', 'meeting', 'court_session', 'other'),
    defaultValue: 'meeting',
    comment: 'نوع الموعد'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'rescheduled'),
    defaultValue: 'scheduled',
    comment: 'حالة الموعد'
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'تم إرسال التذكير'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  }
}, {
  timestamps: true,
  tableName: 'appointments'
});

export default Appointment;
