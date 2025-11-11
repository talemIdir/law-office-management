import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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
  sequelize
} from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false,
    backgroundColor: '#f5f5f5'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize app
app.whenReady().then(async () => {
  await initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for CRUD operations

// Generic CRUD handlers
function setupCrudHandlers(modelName, model) {
  // Get all
  ipcMain.handle(`${modelName}:getAll`, async (event, options = {}) => {
    try {
      const items = await model.findAll({
        ...options,
        order: options.order || [['createdAt', 'DESC']]
      });
      return { success: true, data: items };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get by ID
  ipcMain.handle(`${modelName}:getById`, async (event, id, options = {}) => {
    try {
      const item = await model.findByPk(id, options);
      if (!item) {
        return { success: false, error: 'Item not found' };
      }
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Create
  ipcMain.handle(`${modelName}:create`, async (event, data) => {
    try {
      const item = await model.create(data);
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Update
  ipcMain.handle(`${modelName}:update`, async (event, id, data) => {
    try {
      const item = await model.findByPk(id);
      if (!item) {
        return { success: false, error: 'Item not found' };
      }
      await item.update(data);
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Delete
  ipcMain.handle(`${modelName}:delete`, async (event, id) => {
    try {
      const item = await model.findByPk(id);
      if (!item) {
        return { success: false, error: 'Item not found' };
      }
      await item.destroy();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Search
  ipcMain.handle(`${modelName}:search`, async (event, searchOptions) => {
    try {
      const items = await model.findAll(searchOptions);
      return { success: true, data: items };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// Setup CRUD handlers for all models
setupCrudHandlers('client', Client);
setupCrudHandlers('case', Case);
setupCrudHandlers('courtSession', CourtSession);
setupCrudHandlers('document', Document);
setupCrudHandlers('invoice', Invoice);
setupCrudHandlers('payment', Payment);
setupCrudHandlers('expense', Expense);
setupCrudHandlers('appointment', Appointment);
setupCrudHandlers('user', User);
setupCrudHandlers('setting', Setting);

// Special handlers for complex queries

// Get client with all related data
ipcMain.handle('client:getWithRelations', async (event, id) => {
  try {
    const client = await Client.findByPk(id, {
      include: [
        { model: Case, as: 'cases' },
        { model: Document, as: 'documents' },
        { model: Invoice, as: 'invoices' },
        { model: Appointment, as: 'appointments' }
      ]
    });
    if (!client) {
      return { success: false, error: 'Client not found' };
    }
    return { success: true, data: client };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get case with all related data
ipcMain.handle('case:getWithRelations', async (event, id) => {
  try {
    const caseData = await Case.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: CourtSession, as: 'courtSessions' },
        { model: Document, as: 'documents' },
        { model: Invoice, as: 'invoices' },
        { model: Expense, as: 'expenses' },
        { model: Appointment, as: 'appointments' },
        { model: User, as: 'assignedLawyer' }
      ]
    });
    if (!caseData) {
      return { success: false, error: 'Case not found' };
    }
    return { success: true, data: caseData };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get invoice with payments
ipcMain.handle('invoice:getWithPayments', async (event, id) => {
  try {
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Case, as: 'case' },
        { model: Payment, as: 'payments' }
      ]
    });
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }
    return { success: true, data: invoice };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Dashboard statistics
ipcMain.handle('dashboard:getStats', async () => {
  try {
    const [
      totalClients,
      activeClients,
      totalCases,
      activeCases,
      upcomingSessions,
      totalInvoices,
      unpaidInvoices,
      totalRevenue,
      pendingRevenue
    ] = await Promise.all([
      Client.count(),
      Client.count({ where: { status: 'active' } }),
      Case.count(),
      Case.count({ where: { status: ['open', 'in_progress'] } }),
      CourtSession.count({
        where: {
          status: 'scheduled',
          sessionDate: { [sequelize.Op.gte]: new Date() }
        }
      }),
      Invoice.count(),
      Invoice.count({ where: { status: ['sent', 'overdue'] } }),
      Invoice.sum('totalAmount', { where: { status: 'paid' } }) || 0,
      Invoice.sum('totalAmount', { where: { status: ['sent', 'overdue', 'partially_paid'] } }) || 0
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
        unpaidInvoices,
        totalRevenue,
        pendingRevenue
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get upcoming court sessions
ipcMain.handle('courtSession:getUpcoming', async (event, limit = 10) => {
  try {
    const sessions = await CourtSession.findAll({
      where: {
        status: 'scheduled',
        sessionDate: { [sequelize.Op.gte]: new Date() }
      },
      include: [
        {
          model: Case,
          as: 'case',
          include: [{ model: Client, as: 'client' }]
        }
      ],
      order: [['sessionDate', 'ASC']],
      limit
    });
    return { success: true, data: sessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get upcoming appointments
ipcMain.handle('appointment:getUpcoming', async (event, limit = 10) => {
  try {
    const appointments = await Appointment.findAll({
      where: {
        status: 'scheduled',
        appointmentDate: { [sequelize.Op.gte]: new Date() }
      },
      include: [
        { model: Client, as: 'client' },
        { model: Case, as: 'case' }
      ],
      order: [['appointmentDate', 'ASC']],
      limit
    });
    return { success: true, data: appointments };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Financial reports
ipcMain.handle('reports:financial', async (event, startDate, endDate) => {
  try {
    const [invoices, payments, expenses] = await Promise.all([
      Invoice.findAll({
        where: {
          invoiceDate: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        include: [{ model: Client, as: 'client' }]
      }),
      Payment.findAll({
        where: {
          paymentDate: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        include: [{ model: Invoice, as: 'invoice' }]
      }),
      Expense.findAll({
        where: {
          expenseDate: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        }
      })
    ]);

    const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
    const totalPaid = payments.reduce((sum, pay) => sum + parseFloat(pay.amount), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const netIncome = totalPaid - totalExpenses;

    return {
      success: true,
      data: {
        invoices,
        payments,
        expenses,
        totalInvoiced,
        totalPaid,
        totalExpenses,
        netIncome
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Export data handler (for future use)
ipcMain.handle('export:data', async (event, type, filters) => {
  try {
    // Implementation for exporting data to PDF/Excel
    return { success: true, message: 'Export functionality to be implemented' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

console.log('Electron main process started');
