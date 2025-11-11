/**
 * Services Index
 * Central export point for all application services
 */

import clientService from "./clientService.js";
import caseService from "./caseService.js";
import appointmentService from "./appointmentService.js";
import invoiceService from "./invoiceService.js";
import paymentService from "./paymentService.js";
import expenseService from "./expenseService.js";
import documentService from "./documentService.js";
import courtSessionService from "./courtSessionService.js";
import userService from "./userService.js";
import settingService from "./settingService.js";

export {
  clientService,
  caseService,
  appointmentService,
  invoiceService,
  paymentService,
  expenseService,
  documentService,
  courtSessionService,
  userService,
  settingService,
};

// Default export with all services
export default {
  clientService,
  caseService,
  appointmentService,
  invoiceService,
  paymentService,
  expenseService,
  documentService,
  courtSessionService,
  userService,
  settingService,
};
