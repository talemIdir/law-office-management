import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

// Case Model - نموذج القضية
const Case = sequelize.define('Case', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'رقم القضية'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'عنوان القضية'
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'وصف القضية'
  },
  caseType: {
    type: DataTypes.ENUM('civil', 'criminal', 'commercial', 'administrative', 'family', 'labor', 'other'),
    allowNull: false,
    comment: 'نوع القضية: مدني، جنائي، تجاري، إداري، أسري، عمالي، أخرى'
  },
  court: {
    type: DataTypes.STRING,
    comment: 'المحكمة'
  },
  courtType: {
    type: DataTypes.ENUM('محكمة ابتدائية', 'محكمة استئناف', 'المحكمة العليا', 'مجلس الدولة', 'محكمة الجنايات'),
    comment: 'نوع المحكمة'
  },
  judge: {
    type: DataTypes.STRING,
    comment: 'القاضي'
  },
  opposingParty: {
    type: DataTypes.STRING,
    comment: 'الطرف المقابل'
  },
  opposingLawyer: {
    type: DataTypes.STRING,
    comment: 'محامي الطرف المقابل'
  },
  clientRole: {
    type: DataTypes.ENUM('plaintiff', 'defendant'),
    allowNull: false,
    comment: 'دور العميل: مدعي أو مدعى عليه'
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'won', 'lost', 'settled', 'closed', 'appealed'),
    defaultValue: 'open',
    comment: 'حالة القضية'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    comment: 'الأولوية'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    comment: 'تاريخ بداية القضية'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    comment: 'تاريخ انتهاء القضية'
  },
  nextHearingDate: {
    type: DataTypes.DATE,
    comment: 'موعد الجلسة القادمة'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    comment: 'المبلغ المطالب به'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  }
}, {
  timestamps: true,
  tableName: 'cases'
});

export default Case;
