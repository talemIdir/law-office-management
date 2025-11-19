import { BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let licenseWindow = null;

/**
 * Create the license activation window
 */
export function createLicenseWindow(licenseService) {
  if (licenseWindow) {
    licenseWindow.focus();
    return licenseWindow;
  }

  licenseWindow = new BrowserWindow({
    width: 800,
    height: 700,
    resizable: false,
    maximizable: false,
    minimizable: false,
    modal: true,
    show: false,
    backgroundColor: '#f5f5f5',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the license activation HTML
  const licenseHtmlPath = path.join(__dirname, 'licenseActivation.html');
  licenseWindow.loadFile(licenseHtmlPath);

  licenseWindow.once('ready-to-show', () => {
    licenseWindow.show();
  });

  licenseWindow.on('closed', () => {
    licenseWindow = null;
  });

  // Setup IPC handlers for license window
  setupLicenseHandlers(licenseService);

  return licenseWindow;
}

/**
 * Close the license window
 */
export function closeLicenseWindow() {
  if (licenseWindow) {
    licenseWindow.close();
    licenseWindow = null;
  }
}

/**
 * Setup IPC handlers for license operations
 */
function setupLicenseHandlers(licenseService) {
  // Get machine ID
  ipcMain.handle('license:getMachineId', async () => {
    try {
      const machineId = licenseService.getMachineId();
      return { success: true, machineId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Activate license
  ipcMain.handle('license:activate', async (event, licenseKey, customerName, customerEmail) => {
    try {
      const result = await licenseService.activateLicense(licenseKey, customerName, customerEmail);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get license info
  ipcMain.handle('license:getInfo', async () => {
    try {
      const info = await licenseService.getLicenseInfo();
      return { success: true, data: info };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Check license validity
  ipcMain.handle('license:check', async () => {
    try {
      const result = await licenseService.checkLicense();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Deactivate license
  ipcMain.handle('license:deactivate', async () => {
    try {
      const result = await licenseService.deactivateLicense();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
