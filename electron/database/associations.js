import Client from './models/Client.js';
import Case from './models/Case.js';
import CourtSession from './models/CourtSession.js';
import Document from './models/Document.js';
import Invoice from './models/Invoice.js';
import Payment from './models/Payment.js';
import Expense from './models/Expense.js';
import Appointment from './models/Appointment.js';
import User from './models/User.js';

// Define all model relationships
function setupAssociations() {
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
}

export default setupAssociations;
