import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { app } from 'electron';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database
const dbPath = path.join(app.getPath('userData'), 'law-office.db');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

// Define Models

// Client Model - نموذج العميل
const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('individual', 'company'),
    allowNull: false,
    defaultValue: 'individual',
    comment: 'نوع العميل: فرد أو شركة'
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'الاسم الأول'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'اسم العائلة'
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'اسم الشركة'
  },
  nationalId: {
    type: DataTypes.STRING,
    unique: true,
    comment: 'رقم البطاقة الوطنية'
  },
  taxId: {
    type: DataTypes.STRING,
    comment: 'الرقم الجبائي'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'رقم الهاتف'
  },
  email: {
    type: DataTypes.STRING,
    comment: 'البريد الإلكتروني'
  },
  address: {
    type: DataTypes.TEXT,
    comment: 'العنوان'
  },
  city: {
    type: DataTypes.STRING,
    comment: 'المدينة'
  },
  wilaya: {
    type: DataTypes.STRING,
    comment: 'الولاية'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    defaultValue: 'active',
    comment: 'الحالة'
  }
}, {
  timestamps: true,
  tableName: 'clients'
});

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

// Invoice Model - نموذج الفاتورة
const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'رقم الفاتورة'
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'تاريخ الفاتورة'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    comment: 'تاريخ الاستحقاق'
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'الوصف'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'المبلغ (دج)'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    comment: 'مبلغ الضريبة'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'المبلغ الإجمالي'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    comment: 'المبلغ المدفوع'
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'),
    defaultValue: 'draft',
    comment: 'حالة الفاتورة'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  }
}, {
  timestamps: true,
  tableName: 'invoices'
});

// Payment Model - نموذج الدفعة
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'تاريخ الدفع'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'المبلغ (دج)'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'check', 'bank_transfer', 'credit_card', 'other'),
    allowNull: false,
    comment: 'طريقة الدفع'
  },
  reference: {
    type: DataTypes.STRING,
    comment: 'المرجع / رقم الشيك'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  }
}, {
  timestamps: true,
  tableName: 'payments'
});

// Expense Model - نموذج المصروف
const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'تاريخ المصروف'
  },
  category: {
    type: DataTypes.ENUM('court_fees', 'transportation', 'documentation', 'office_supplies', 'utilities', 'salaries', 'other'),
    allowNull: false,
    comment: 'فئة المصروف'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'الوصف'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'المبلغ (دج)'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'check', 'bank_transfer', 'credit_card', 'other'),
    comment: 'طريقة الدفع'
  },
  reference: {
    type: DataTypes.STRING,
    comment: 'المرجع'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'ملاحظات'
  }
}, {
  timestamps: true,
  tableName: 'expenses'
});

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

// User Model - نموذج المستخدم
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'اسم المستخدم'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'كلمة المرور'
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'الاسم الكامل'
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    comment: 'البريد الإلكتروني'
  },
  role: {
    type: DataTypes.ENUM('admin', 'lawyer', 'assistant'),
    defaultValue: 'assistant',
    comment: 'الدور'
  },
  phone: {
    type: DataTypes.STRING,
    comment: 'رقم الهاتف'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: 'الحالة'
  }
}, {
  timestamps: true,
  tableName: 'users'
});

// Settings Model - نموذج الإعدادات
const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'المفتاح'
  },
  value: {
    type: DataTypes.TEXT,
    comment: 'القيمة'
  },
  category: {
    type: DataTypes.STRING,
    comment: 'الفئة'
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'الوصف'
  }
}, {
  timestamps: true,
  tableName: 'settings'
});

// Define Relationships

// Client - Case (One-to-Many)
Client.hasMany(Case, { foreignKey: 'clientId', as: 'cases', onDelete: 'CASCADE' });
Case.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Case - CourtSession (One-to-Many)
Case.hasMany(CourtSession, { foreignKey: 'caseId', as: 'courtSessions', onDelete: 'CASCADE' });
CourtSession.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

// Case - Document (One-to-Many)
Case.hasMany(Document, { foreignKey: 'caseId', as: 'documents', onDelete: 'SET NULL' });
Document.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

// Client - Document (One-to-Many)
Client.hasMany(Document, { foreignKey: 'clientId', as: 'documents', onDelete: 'SET NULL' });
Document.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Client - Invoice (One-to-Many)
Client.hasMany(Invoice, { foreignKey: 'clientId', as: 'invoices', onDelete: 'CASCADE' });
Invoice.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Case - Invoice (One-to-Many)
Case.hasMany(Invoice, { foreignKey: 'caseId', as: 'invoices', onDelete: 'SET NULL' });
Invoice.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

// Invoice - Payment (One-to-Many)
Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments', onDelete: 'CASCADE' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

// Case - Expense (One-to-Many)
Case.hasMany(Expense, { foreignKey: 'caseId', as: 'expenses', onDelete: 'SET NULL' });
Expense.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

// Client - Appointment (One-to-Many)
Client.hasMany(Appointment, { foreignKey: 'clientId', as: 'appointments', onDelete: 'SET NULL' });
Appointment.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Case - Appointment (One-to-Many)
Case.hasMany(Appointment, { foreignKey: 'caseId', as: 'appointments', onDelete: 'SET NULL' });
Appointment.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

// User - Assignment relationships
User.hasMany(Case, { foreignKey: 'assignedLawyerId', as: 'assignedCases' });
Case.belongsTo(User, { foreignKey: 'assignedLawyerId', as: 'assignedLawyer' });

// Initialize database
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

export {
  sequelize,
  initDatabase,
  Client,
  Case,
  CourtSession,
  Document,
  Invoice,
  Payment,
  Expense,
  Appointment,
  User,
  Setting
};
