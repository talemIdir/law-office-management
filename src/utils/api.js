const { ipcRenderer } = window.require
  ? window.require("electron")
  : { ipcRenderer: null };

// Generic API helper for Electron IPC
class API {
  constructor(modelName) {
    this.modelName = modelName;
  }

  async getAll(options = {}) {
    if (!ipcRenderer)
      return { success: false, error: "Electron not available" };
    return await ipcRenderer.invoke(`${this.modelName}:getAll`, options);
  }

  async getById(id, options = {}) {
    if (!ipcRenderer)
      return { success: false, error: "Electron not available" };
    return await ipcRenderer.invoke(`${this.modelName}:getById`, id, options);
  }

  async create(data) {
    if (!ipcRenderer)
      return { success: false, error: "Electron not available" };
    return await ipcRenderer.invoke(`${this.modelName}:create`, data);
  }

  async update(id, data) {
    if (!ipcRenderer)
      return { success: false, error: "Electron not available" };
    return await ipcRenderer.invoke(`${this.modelName}:update`, id, data);
  }

  async delete(id) {
    if (!ipcRenderer)
      return { success: false, error: "Electron not available" };
    return await ipcRenderer.invoke(`${this.modelName}:delete`, id);
  }

  async search(searchOptions) {
    if (!ipcRenderer)
      return { success: false, error: "Electron not available" };
    return await ipcRenderer.invoke(`${this.modelName}:search`, searchOptions);
  }
}

// Model-specific APIs
export const clientAPI = new API("client");
export const caseAPI = new API("case");
export const courtSessionAPI = new API("courtSession");
export const documentAPI = new API("document");
export const invoiceAPI = new API("invoice");
export const paymentAPI = new API("payment");
export const expenseAPI = new API("expense");
export const appointmentAPI = new API("appointment");
export const userAPI = new API("user");
export const settingAPI = new API("setting");

// Special API calls
export const getClientWithRelations = async (id) => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("client:getWithRelations", id);
};

export const getCaseWithRelations = async (id) => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("case:getWithRelations", id);
};

export const getInvoiceWithPayments = async (id) => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("invoice:getWithPayments", id);
};

export const getDashboardStats = async () => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("dashboard:getStats");
};

export const getUpcomingCourtSessions = async (limit = 10) => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("courtSession:getUpcoming", limit);
};

export const getUpcomingAppointments = async (limit = 10) => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("appointment:getUpcoming", limit);
};

export const getFinancialReport = async (startDate, endDate) => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("reports:financial", startDate, endDate);
};

// Document-specific operations
export const selectFile = async () => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("dialog:selectFile");
};

export const copyDocumentFile = async (sourceFilePath, clientName, caseNumber, documentTitle) => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("document:copyFile", sourceFilePath, clientName, caseNumber, documentTitle);
};

export const openDocumentFile = async (filePath) => {
  if (!ipcRenderer) return { success: false, error: "Electron not available" };
  return await ipcRenderer.invoke("document:openFile", filePath);
};
