import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import started from "electron-squirrel-startup";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import {
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
  sequelize,
  Op,
} from "./database/index.js";
import {
  clientService,
  caseService,
  courtSessionService,
  documentService,
  invoiceService,
  paymentService,
  expenseService,
  appointmentService,
  userService,
  settingService,
} from "./database/services/index.js";
import jurisdictionalService from "./database/services/jurisdictionalService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    },
    show: false,
    backgroundColor: "#f5f5f5",
  });

  // Load the app
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // Use loadURL with file protocol for better path resolution
    mainWindow.loadURL(
      `file://${path.join(__dirname, "../dist/index.html").replace(/\\/g, "/")}`
    );
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Initialize app
app.whenReady().then(async () => {
  await initDatabase();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC Handlers for CRUD operations

// Generic CRUD handlers
function setupCrudHandlers(modelName, service) {
  // Capitalize first letter for method names
  const capitalizedName = modelName.charAt(0).toUpperCase() + modelName.slice(1);

  // Get all
  ipcMain.handle(`${modelName}:getAll`, async (event, options = {}) => {
    try {
      const result = await service[`getAll${capitalizedName}s`](options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get by ID
  ipcMain.handle(`${modelName}:getById`, async (event, id, options = {}) => {
    try {
      const result = await service[`get${capitalizedName}ById`](id, options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Create
  ipcMain.handle(`${modelName}:create`, async (event, data) => {
    try {
      const result = await service[`create${capitalizedName}`](data);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Update
  ipcMain.handle(`${modelName}:update`, async (event, id, data) => {
    try {
      const result = await service[`update${capitalizedName}`](id, data);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Delete
  ipcMain.handle(`${modelName}:delete`, async (event, id) => {
    try {
      const result = await service[`delete${capitalizedName}`](id);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Search (if service has search method)
  if (service[`search${capitalizedName}s`]) {
    ipcMain.handle(`${modelName}:search`, async (event, searchTerm) => {
      try {
        const result = await service[`search${capitalizedName}s`](searchTerm);
        return result;
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
}

// Setup CRUD handlers for all models using services
setupCrudHandlers("client", clientService);
setupCrudHandlers("case", caseService);
setupCrudHandlers("courtSession", courtSessionService);
setupCrudHandlers("document", documentService);
setupCrudHandlers("invoice", invoiceService);
setupCrudHandlers("payment", paymentService);
setupCrudHandlers("expense", expenseService);
setupCrudHandlers("appointment", appointmentService);
setupCrudHandlers("user", userService);

// Settings has special handling (uses key instead of id)
ipcMain.handle("setting:getAll", async (event, options = {}) => {
  try {
    return await settingService.getAllSettings(options);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("setting:getById", async (event, key) => {
  try {
    return await settingService.getSetting(key);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("setting:create", async (event, data) => {
  try {
    return await settingService.setSetting(data.key, data.value, data);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("setting:update", async (event, key, data) => {
  try {
    return await settingService.updateSetting(key, data.value);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("setting:delete", async (event, key) => {
  try {
    return await settingService.deleteSetting(key);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Special handlers for complex queries

// Get client with all related data
ipcMain.handle("client:getWithRelations", async (event, id) => {
  try {
    const client = await Client.findByPk(id, {
      include: [
        { model: Case, as: "cases" },
        { model: Document, as: "documents" },
        { model: Invoice, as: "invoices" },
        { model: Appointment, as: "appointments" },
      ],
    });
    if (!client) {
      return { success: false, error: "Client not found" };
    }
    return { success: true, data: client };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get case with all related data
ipcMain.handle("case:getWithRelations", async (event, id) => {
  try {
    const caseData = await Case.findByPk(id, {
      include: [
        { model: Client, as: "client" },
        { model: CourtSession, as: "courtSessions" },
        { model: Document, as: "documents" },
        { model: Invoice, as: "invoices" },
        { model: Expense, as: "expenses" },
        { model: Appointment, as: "appointments" },
        { model: User, as: "assignedLawyer" },
      ],
    });
    if (!caseData) {
      return { success: false, error: "Case not found" };
    }
    return { success: true, data: caseData };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get invoice with details
ipcMain.handle("invoice:getWithPayments", async (event, id) => {
  try {
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: "client" },
        { model: Case, as: "case" },
      ],
    });
    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }
    return { success: true, data: invoice };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Dashboard statistics
ipcMain.handle("dashboard:getStats", async () => {
  try {
    const [
      totalClients,
      activeClients,
      totalCases,
      activeCases,
      upcomingSessions,
      totalInvoices,
      totalRevenue,
    ] = await Promise.all([
      Client.count(),
      Client.count({ where: { status: "active" } }),
      Case.count(),
      Case.count({ where: { status: ["open", "in_progress"] } }),
      CourtSession.count({
        where: {
          sessionDate: { [Op.gte]: new Date() },
        },
      }),
      Invoice.count(),
      Payment.sum("amount") || 0,
    ]);

    return {
      success: true,
      data: {
        totalClients,
        activeClients,
        totalCases,
        activeCases,
        upcomingSessions,
        totalInvoices,
        totalRevenue,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get upcoming court sessions
ipcMain.handle("courtSession:getUpcoming", async (event, limit = 10) => {
  try {
    const sessions = await CourtSession.findAll({
      where: {
        sessionDate: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Case,
          as: "case",
          include: [{ model: Client, as: "client" }],
        },
      ],
      order: [["sessionDate", "ASC"]],
      limit,
    });
    // Convert Sequelize instances to plain objects to avoid serialization issues
    const plainSessions = sessions.map(session => session.toJSON());
    return { success: true, data: plainSessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get upcoming appointments
ipcMain.handle("appointment:getUpcoming", async (event, limit = 10) => {
  try {
    const appointments = await Appointment.findAll({
      where: {
        status: "scheduled",
        appointmentDate: { [Op.gte]: new Date() },
      },
      include: [
        { model: Client, as: "client" },
        { model: Case, as: "case" },
      ],
      order: [["appointmentDate", "ASC"]],
      limit,
    });
    // Convert Sequelize instances to plain objects to avoid serialization issues
    const plainAppointments = appointments.map(appointment => appointment.toJSON());
    return { success: true, data: plainAppointments };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Financial reports
ipcMain.handle("reports:financial", async (event, startDate, endDate) => {
  try {
    const [invoices, payments, expenses] = await Promise.all([
      Invoice.findAll({
        where: {
          invoiceDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" }
        ],
      }),
      Payment.findAll({
        where: {
          paymentDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      }),
      Expense.findAll({
        where: {
          expenseDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      }),
    ]);

    // Calculate total invoiced by summing case amounts with tax
    const totalInvoiced = invoices.reduce((sum, inv) => {
      const caseAmount = inv.case ? parseFloat(inv.case.amount || 0) : 0;
      const taxAmount = (caseAmount * parseFloat(inv.taxPercentage || 0)) / 100;
      return sum + caseAmount + taxAmount;
    }, 0);

    const totalPaid = payments.reduce(
      (sum, pay) => sum + parseFloat(pay.amount),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    const netIncome = totalPaid - totalExpenses;

    // Convert Sequelize instances to plain objects
    const plainInvoices = invoices.map(inv => inv.toJSON());
    const plainPayments = payments.map(pay => pay.toJSON());
    const plainExpenses = expenses.map(exp => exp.toJSON());

    return {
      success: true,
      data: {
        invoices: plainInvoices,
        payments: plainPayments,
        expenses: plainExpenses,
        totalInvoiced,
        totalPaid,
        totalExpenses,
        netIncome,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Export data handler (for future use)
ipcMain.handle("export:data", async (event, type, filters) => {
  try {
    // Implementation for exporting data to PDF/Excel
    return { success: true, message: "Export functionality to be implemented" };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Jurisdictional data handlers
ipcMain.handle("jurisdiction:getAllJudicialCouncils", async () => {
  try {
    const councils = await jurisdictionalService.getAllJudicialCouncils();
    // Convert Sequelize instances to plain objects to avoid serialization issues
    const plainCouncils = councils.map(council => council.toJSON());
    return { success: true, data: plainCouncils };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("jurisdiction:getJudicialCouncilById", async (event, id) => {
  try {
    const council = await jurisdictionalService.getJudicialCouncilById(id);
    return { success: true, data: council ? council.toJSON() : null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("jurisdiction:getAllFirstDegreeCourts", async (event, filters = {}) => {
  try {
    const courts = await jurisdictionalService.getAllFirstDegreeCourts(filters);
    const plainCourts = courts.map(court => court.toJSON());
    return { success: true, data: plainCourts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("jurisdiction:getCourtsByCouncilId", async (event, councilId) => {
  try {
    const courts = await jurisdictionalService.getCourtsByCouncilId(councilId);
    const plainCourts = courts.map(court => court.toJSON());
    return { success: true, data: plainCourts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("jurisdiction:getAllAdministrativeAppealCourts", async () => {
  try {
    const courts = await jurisdictionalService.getAllAdministrativeAppealCourts();
    const plainCourts = courts.map(court => court.toJSON());
    return { success: true, data: plainCourts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("jurisdiction:getAllAdministrativeCourts", async (event, filters = {}) => {
  try {
    const courts = await jurisdictionalService.getAllAdministrativeCourts(filters);
    const plainCourts = courts.map(court => court.toJSON());
    return { success: true, data: plainCourts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("jurisdiction:getAdminCourtsByAppealCourtId", async (event, appealCourtId) => {
  try {
    const courts = await jurisdictionalService.getAdminCourtsByAppealCourtId(appealCourtId);
    const plainCourts = courts.map(court => court.toJSON());
    return { success: true, data: plainCourts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("jurisdiction:getAllCommercialCourts", async () => {
  try {
    const courts = await jurisdictionalService.getAllCommercialCourts();
    const plainCourts = courts.map(court => court.toJSON());
    return { success: true, data: plainCourts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("jurisdiction:getCommercialCourtById", async (event, id) => {
  try {
    const court = await jurisdictionalService.getCommercialCourtById(id);
    return { success: true, data: court ? court.toJSON() : null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("jurisdiction:getAllCourts", async () => {
  try {
    const courts = await jurisdictionalService.getAllCourts();
    // Convert all court types to plain objects
    const plainCourts = {
      firstDegreeCourts: courts.firstDegreeCourts.map(c => c.toJSON()),
      administrativeCourts: courts.administrativeCourts.map(c => c.toJSON()),
      commercialCourts: courts.commercialCourts.map(c => c.toJSON())
    };
    return { success: true, data: plainCourts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// File dialog handler for selecting documents
ipcMain.handle("dialog:selectFile", async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [
        { name: "Documents", extensions: ["pdf", "doc", "docx", "txt"] },
        { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "bmp"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    const stats = await fs.stat(filePath);

    return {
      success: true,
      data: {
        filePath,
        fileName,
        fileSize: stats.size,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Copy file to documents folder with organized structure
ipcMain.handle("document:copyFile", async (event, sourceFilePath, clientName, caseNumber, documentTitle) => {
  try {
    // Sanitize folder names by replacing invalid characters
    const sanitizeFolderName = (name) => {
      // Replace forward slashes, backslashes, colons, and other invalid characters
      return name.replace(/[\/\\:*?"<>|]/g, '_');
    };

    // Get the app's user data path
    const userDataPath = app.getPath("userData");

    // Sanitize client name and case number for folder names
    const sanitizedClientName = sanitizeFolderName(clientName);
    const sanitizedCaseNumber = sanitizeFolderName(caseNumber);
    const sanitizedDocTitle = sanitizeFolderName(documentTitle);

    // Create documents folder structure: documents/clientName/caseNumber/
    const documentsDir = path.join(userDataPath, "documents", sanitizedClientName, sanitizedCaseNumber);

    // Create directories if they don't exist
    await fs.mkdir(documentsDir, { recursive: true });

    // Get file extension from source file
    const fileExt = path.extname(sourceFilePath);

    // Create new filename using document title
    const newFileName = `${sanitizedDocTitle}${fileExt}`;
    const destinationPath = path.join(documentsDir, newFileName);

    // Copy the file
    await fs.copyFile(sourceFilePath, destinationPath);

    // Get file stats
    const stats = await fs.stat(destinationPath);

    return {
      success: true,
      data: {
        filePath: destinationPath,
        fileName: newFileName,
        fileSize: stats.size,
      },
    };
  } catch (error) {
    console.error("Error copying file:", error);
    return { success: false, error: error.message };
  }
});

// Open file in default application
ipcMain.handle("document:openFile", async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

console.log("Electron main process started");
