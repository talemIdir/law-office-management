import Client from "./models/Client.js";
import Case from "./models/Case.js";
import CourtSession from "./models/CourtSession.js";
import Document from "./models/Document.js";
import Invoice from "./models/Invoice.js";
import Payment from "./models/Payment.js";
import Expense from "./models/Expense.js";
import Appointment from "./models/Appointment.js";
import User from "./models/User.js";
import JudicialCouncil from "./models/JudicialCouncil.js";
import FirstDegreeCourt from "./models/FirstDegreeCourt.js";
import AdministrativeAppealCourt from "./models/AdministrativeAppealCourt.js";
import AdministrativeCourt from "./models/AdministrativeCourt.js";
import SpecializedCommercialCourt from "./models/SpecializedCommercialCourt.js";
import SupremeCourt from "./models/SupremeCourt.js";
import SupremeChamber from "./models/SupremeChamber.js";
import StateCouncil from "./models/StateCouncil.js";
import StateCouncilChamber from "./models/StateCouncilChamber.js";

// Define all model relationships
function setupAssociations() {
  // Client - Case (One-to-Many)
  Client.hasMany(Case, {
    foreignKey: "clientId",
    as: "cases",
    onDelete: "CASCADE",
  });
  Case.belongsTo(Client, { foreignKey: "clientId", as: "client" });

  // Case - CourtSession (One-to-Many)
  Case.hasMany(CourtSession, {
    foreignKey: "caseId",
    as: "courtSessions",
    onDelete: "CASCADE",
  });
  CourtSession.belongsTo(Case, { foreignKey: "caseId", as: "case" });

  // Case - Document (One-to-Many)
  Case.hasMany(Document, {
    foreignKey: "caseId",
    as: "documents",
    onDelete: "SET NULL",
  });
  Document.belongsTo(Case, { foreignKey: "caseId", as: "case" });

  // Client - Document (One-to-Many)
  Client.hasMany(Document, {
    foreignKey: "clientId",
    as: "documents",
    onDelete: "SET NULL",
  });
  Document.belongsTo(Client, { foreignKey: "clientId", as: "client" });

  // Client - Invoice (One-to-Many)
  Client.hasMany(Invoice, {
    foreignKey: "clientId",
    as: "invoices",
    onDelete: "CASCADE",
  });
  Invoice.belongsTo(Client, { foreignKey: "clientId", as: "client" });

  // Case - Invoice (One-to-Many)
  Case.hasMany(Invoice, {
    foreignKey: "caseId",
    as: "invoices",
    onDelete: "SET NULL",
  });
  Invoice.belongsTo(Case, { foreignKey: "caseId", as: "case" });

  // Case - Payment (One-to-Many)
  Case.hasMany(Payment, {
    foreignKey: "caseId",
    as: "payments",
    onDelete: "CASCADE",
  });
  Payment.belongsTo(Case, { foreignKey: "caseId", as: "case" });

  // Case - Expense (One-to-Many)
  Case.hasMany(Expense, {
    foreignKey: "caseId",
    as: "expenses",
    onDelete: "SET NULL",
  });
  Expense.belongsTo(Case, { foreignKey: "caseId", as: "case" });

  // Client - Appointment (One-to-Many)
  Client.hasMany(Appointment, {
    foreignKey: "clientId",
    as: "appointments",
    onDelete: "SET NULL",
  });
  Appointment.belongsTo(Client, { foreignKey: "clientId", as: "client" });

  // Case - Appointment (One-to-Many)
  Case.hasMany(Appointment, {
    foreignKey: "caseId",
    as: "appointments",
    onDelete: "SET NULL",
  });
  Appointment.belongsTo(Case, { foreignKey: "caseId", as: "case" });

  // User - Assignment relationships
  User.hasMany(Case, { foreignKey: "assignedLawyerId", as: "assignedCases" });
  Case.belongsTo(User, {
    foreignKey: "assignedLawyerId",
    as: "assignedLawyer",
  });

  // Jurisdictional relationships
  // JudicialCouncil - FirstDegreeCourt (One-to-Many)
  JudicialCouncil.hasMany(FirstDegreeCourt, {
    foreignKey: "councilId",
    as: "courts",
    onDelete: "CASCADE",
  });
  FirstDegreeCourt.belongsTo(JudicialCouncil, {
    foreignKey: "councilId",
    as: "council",
  });

  // AdministrativeAppealCourt - AdministrativeCourt (One-to-Many)
  AdministrativeAppealCourt.hasMany(AdministrativeCourt, {
    foreignKey: "appealCourtId",
    as: "courts",
    onDelete: "CASCADE",
  });
  AdministrativeCourt.belongsTo(AdministrativeAppealCourt, {
    foreignKey: "appealCourtId",
    as: "appealCourt",
  });

  // SupremeCourt - SupremeChamber (One-to-Many)
  SupremeCourt.hasMany(SupremeChamber, {
    foreignKey: "supremeCourtId",
    as: "chambers",
    onDelete: "CASCADE",
  });
  SupremeChamber.belongsTo(SupremeCourt, {
    foreignKey: "supremeCourtId",
    as: "supremeCourt",
  });

  // StateCouncil - StateCouncilChamber (One-to-Many)
  StateCouncil.hasMany(StateCouncilChamber, {
    foreignKey: "stateCouncilId",
    as: "chambers",
    onDelete: "CASCADE",
  });
  StateCouncilChamber.belongsTo(StateCouncil, {
    foreignKey: "stateCouncilId",
    as: "stateCouncil",
  });
}

export default setupAssociations;
