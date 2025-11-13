// Import database configuration
import { sequelize, initDatabase } from "./config.js";
import { Op } from "sequelize";

// Import all models
import Client from "./models/Client.js";
import Case from "./models/Case.js";
import CourtSession from "./models/CourtSession.js";
import Document from "./models/Document.js";
import Invoice from "./models/Invoice.js";
import Payment from "./models/Payment.js";
import Expense from "./models/Expense.js";
import Appointment from "./models/Appointment.js";
import User from "./models/User.js";
import Setting from "./models/Setting.js";

// Import and setup associations
import setupAssociations from "./associations.js";

// Setup model associations
setupAssociations();

// Export everything
export {
  Op,
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
  Setting,
};
