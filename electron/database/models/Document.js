import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

// Document Model - نموذج المستند
const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'عنوان المستند'
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'وصف المستند'
  },
  documentType: {
    type: DataTypes.ENUM('contract', 'court_filing', 'evidence', 'correspondence', 'id_document', 'power_of_attorney', 'other'),
    allowNull: false,
    comment: 'نوع المستند'
  },
  filePath: {
    type: DataTypes.STRING,
    comment: 'مسار الملف'
  },
  fileName: {
    type: DataTypes.STRING,
    comment: 'اسم الملف'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    comment: 'حجم الملف بالبايت'
  },
  mimeType: {
    type: DataTypes.STRING,
    comment: 'نوع الملف'
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'تاريخ الرفع'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  }
}, {
  timestamps: true,
  tableName: 'documents'
});

export default Document;
