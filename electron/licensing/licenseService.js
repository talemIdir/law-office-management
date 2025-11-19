import CryptoJS from "crypto-js";
import fs from "fs";
import path from "path";
import { app } from "electron";
import os from "os";

/**
 * Offline License Validation Service
 *
 * This system uses hardware-bound license keys that work completely offline.
 *
 * How it works:
 * 1. Each customer gets a unique license key based on their machine ID
 * 2. The license key is validated against the machine's hardware fingerprint
 * 3. License data is stored encrypted locally
 * 4. No internet connection required after initial activation
 */

const LICENSE_FILE_NAME = "license.dat";
const TRIAL_FILE_NAME = "trial.dat";
const TRIAL_DAYS = 7; // Number of days for trial period
const ENCRYPTION_KEY = "LAW_OFFICE_MGMT_2025_SECRET_KEY_CHANGE_THIS"; // Change this to your own secret!

export class LicenseService {
  constructor() {
    this.licenseFilePath = null;
    this.trialFilePath = null;
    this.machineId = null;
  }

  /**
   * Generate a unique machine ID based on system information
   */
  generateMachineId() {
    try {
      // Collect system information
      const hostname = os.hostname();
      const platform = os.platform();
      const arch = os.arch();
      const cpus = os.cpus();
      const totalmem = os.totalmem();

      // Create a unique string from CPU and system info
      const cpuInfo = cpus.length > 0 ? cpus[0].model : "unknown";
      const systemInfo = `${hostname}-${platform}-${arch}-${cpuInfo}-${totalmem}`;

      // Hash the system info to create a consistent machine ID
      const hash = CryptoJS.SHA256(systemInfo).toString();

      // Format as a readable machine ID (first 32 chars, formatted)
      const machineId = hash.substring(0, 32).toUpperCase();
      const formatted = machineId.match(/.{1,8}/g).join("-");

      return formatted;
    } catch (error) {
      console.error("Error generating machine ID:", error);
      // Fallback to hostname-based ID
      const fallback = CryptoJS.SHA256(os.hostname())
        .toString()
        .substring(0, 32)
        .toUpperCase();
      return fallback.match(/.{1,8}/g).join("-");
    }
  }

  /**
   * Initialize the license service
   */
  async initialize() {
    try {
      // Get machine ID (unique hardware fingerprint)
      this.machineId = this.generateMachineId();

      // Set license file path in app's user data directory
      const userDataPath = app.getPath("userData");
      this.licenseFilePath = path.join(userDataPath, LICENSE_FILE_NAME);
      this.trialFilePath = path.join(userDataPath, TRIAL_FILE_NAME);

      return { success: true };
    } catch (error) {
      console.error("Failed to initialize license service:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the machine ID (hardware fingerprint)
   * This is what the customer will send you to get their license key
   */
  getMachineId() {
    return this.machineId;
  }

  /**
   * Validate a license key format
   * License key format: XXXX-XXXX-XXXX-XXXX-XXXX
   */
  isValidLicenseKeyFormat(licenseKey) {
    const pattern =
      /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(licenseKey);
  }

  /**
   * Generate a license key for a specific machine ID
   * This function should be used on YOUR side to generate keys for customers
   *
   * @param {string} machineId - The customer's machine ID
   * @param {object} licenseInfo - Additional license information
   * @returns {string} - The generated license key
   */
  static generateLicenseKey(machineId, licenseInfo = {}) {
    const {
      customerName = "Customer",
      customerEmail = "",
      expiryDate = null, // null = perpetual license
      maxActivations = 1,
      issueDate = new Date().toISOString(),
    } = licenseInfo;

    // Create a deterministic hash based only on machine ID
    // This ensures the same machine ID always gets the same license key
    const hash = CryptoJS.HmacSHA256(machineId, ENCRYPTION_KEY).toString();

    // Take first 20 characters of hash and format as license key
    const keyString = hash.substring(0, 20).toUpperCase();
    const formattedKey = keyString.match(/.{1,4}/g).join("-");

    // Store metadata separately (not part of key generation)
    const licenseData = {
      machineId,
      customerName,
      customerEmail,
      expiryDate,
      maxActivations,
      issueDate,
      version: "1.0",
    };

    return {
      licenseKey: formattedKey,
      licenseData: licenseData,
    };
  }

  /**
   * Activate a license with the provided license key
   */
  async activateLicense(licenseKey, customerName = "", customerEmail = "") {
    try {
      // Validate format
      if (!this.isValidLicenseKeyFormat(licenseKey)) {
        return {
          success: false,
          error:
            "Invalid license key format. Expected format: XXXX-XXXX-XXXX-XXXX-XXXX",
        };
      }

      // Verify the license key against the machine ID
      const verificationResult = this.verifyLicenseKey(
        licenseKey,
        customerName,
        customerEmail
      );

      if (!verificationResult.isValid) {
        return {
          success: false,
          error: "Invalid license key. This key is not valid for this machine.",
        };
      }

      // Create license data
      const licenseData = {
        licenseKey,
        machineId: this.machineId,
        customerName: customerName || "Licensed User",
        customerEmail: customerEmail || "",
        activationDate: new Date().toISOString(),
        expiryDate: null, // Perpetual license
        status: "active",
      };

      // Encrypt and save license data
      const encrypted = this.encryptLicenseData(licenseData);
      await fs.promises.writeFile(this.licenseFilePath, encrypted, "utf8");

      return {
        success: true,
        message: "License activated successfully",
        data: licenseData,
      };
    } catch (error) {
      console.error("License activation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify a license key against the current machine
   * This recreates the key based on machine ID and checks if it matches
   */
  verifyLicenseKey(licenseKey, customerName = "", customerEmail = "") {
    try {
      // Remove dashes for comparison
      const providedKey = licenseKey.replace(/-/g, "");

      // Generate what the key SHOULD be for this machine
      const hash = CryptoJS.HmacSHA256(
        this.machineId,
        ENCRYPTION_KEY
      ).toString();
      const expectedKey = hash.substring(0, 20).toUpperCase();

      // Compare the provided key with the expected key
      const isValid = providedKey === expectedKey;

      return {
        isValid,
        licenseData: {
          machineId: this.machineId,
          customerName,
          customerEmail,
          expiryDate: null,
          maxActivations: 1,
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("License verification error:", error);
      return { isValid: false };
    }
  }

  /**
   * Check if a valid license exists
   */
  async checkLicense() {
    try {
      // Check if license file exists
      if (!fs.existsSync(this.licenseFilePath)) {
        return {
          isValid: false,
          needsActivation: true,
          reason: "No license file found",
        };
      }

      // Read and decrypt license file
      const encrypted = await fs.promises.readFile(
        this.licenseFilePath,
        "utf8"
      );
      const licenseData = this.decryptLicenseData(encrypted);

      if (!licenseData) {
        return {
          isValid: false,
          needsActivation: true,
          reason: "Invalid or corrupted license file",
        };
      }

      // Verify machine ID matches
      if (licenseData.machineId !== this.machineId) {
        return {
          isValid: false,
          needsActivation: true,
          reason: "License is bound to a different machine",
        };
      }

      // Check if license is active
      if (licenseData.status !== "active") {
        return {
          isValid: false,
          needsActivation: true,
          reason: "License is not active",
        };
      }

      // Check expiry date (for perpetual licenses, this will be null)
      if (licenseData.expiryDate) {
        const expiryDate = new Date(licenseData.expiryDate);
        if (expiryDate < new Date()) {
          return {
            isValid: false,
            needsActivation: true,
            reason: "License has expired",
          };
        }
      }

      return {
        isValid: true,
        needsActivation: false,
        licenseData,
      };
    } catch (error) {
      console.error("License check error:", error);
      return {
        isValid: false,
        needsActivation: true,
        reason: error.message,
      };
    }
  }

  /**
   * Get current license information
   */
  async getLicenseInfo() {
    try {
      if (!fs.existsSync(this.licenseFilePath)) {
        return null;
      }

      const encrypted = await fs.promises.readFile(
        this.licenseFilePath,
        "utf8"
      );
      const licenseData = this.decryptLicenseData(encrypted);

      return licenseData;
    } catch (error) {
      console.error("Error reading license info:", error);
      return null;
    }
  }

  /**
   * Deactivate/remove license
   */
  async deactivateLicense() {
    try {
      if (fs.existsSync(this.licenseFilePath)) {
        await fs.promises.unlink(this.licenseFilePath);
      }
      return { success: true, message: "License deactivated" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Start a trial period
   */
  async startTrial() {
    try {
      // Check if trial already exists
      if (fs.existsSync(this.trialFilePath)) {
        return {
          success: false,
          error: "Trial has already been started",
        };
      }

      const trialData = {
        startDate: new Date().toISOString(),
        endDate: new Date(
          Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000
        ).toISOString(),
        machineId: this.machineId,
        status: "active",
      };

      // Encrypt and save trial data
      const encrypted = this.encryptLicenseData(trialData);
      await fs.promises.writeFile(this.trialFilePath, encrypted, "utf8");

      return {
        success: true,
        message: "Trial started successfully",
        data: trialData,
      };
    } catch (error) {
      console.error("Trial start error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check trial status
   */
  async checkTrial() {
    try {
      // Check if trial file exists
      if (!fs.existsSync(this.trialFilePath)) {
        return {
          isActive: false,
          hasStarted: false,
          needsActivation: false,
        };
      }

      // Read and decrypt trial file
      const encrypted = await fs.promises.readFile(this.trialFilePath, "utf8");
      const trialData = this.decryptLicenseData(encrypted);

      if (!trialData) {
        return {
          isActive: false,
          hasStarted: true,
          needsActivation: true,
          reason: "Invalid trial data",
        };
      }

      // Verify machine ID matches
      if (trialData.machineId !== this.machineId) {
        return {
          isActive: false,
          hasStarted: true,
          needsActivation: true,
          reason: "Trial is bound to a different machine",
        };
      }

      // Check if trial has expired
      const endDate = new Date(trialData.endDate);
      const now = new Date();
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      if (endDate < now) {
        return {
          isActive: false,
          hasStarted: true,
          needsActivation: true,
          trialData,
          daysRemaining: 0,
          reason: "Trial has expired",
        };
      }

      return {
        isActive: true,
        hasStarted: true,
        needsActivation: false,
        trialData,
        daysRemaining,
      };
    } catch (error) {
      console.error("Trial check error:", error);
      return {
        isActive: false,
        hasStarted: false,
        needsActivation: false,
        reason: error.message,
      };
    }
  }

  /**
   * Get trial information
   */
  async getTrialInfo() {
    try {
      if (!fs.existsSync(this.trialFilePath)) {
        return null;
      }

      const encrypted = await fs.promises.readFile(this.trialFilePath, "utf8");
      const trialData = this.decryptLicenseData(encrypted);

      if (!trialData) {
        return null;
      }

      const endDate = new Date(trialData.endDate);
      const now = new Date();
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      return {
        ...trialData,
        daysRemaining,
        isExpired: endDate < now,
      };
    } catch (error) {
      console.error("Error reading trial info:", error);
      return null;
    }
  }

  /**
   * Check overall app access (license or trial)
   */
  async checkAccess() {
    try {
      // First check if there's a valid license
      const licenseCheck = await this.checkLicense();

      if (licenseCheck.isValid) {
        return {
          hasAccess: true,
          accessType: "license",
          licenseData: licenseCheck.licenseData,
        };
      }

      // If no valid license, check trial
      const trialCheck = await this.checkTrial();

      if (trialCheck.isActive) {
        return {
          hasAccess: true,
          accessType: "trial",
          daysRemaining: trialCheck.daysRemaining,
          trialData: trialCheck.trialData,
        };
      }

      // If trial hasn't started yet, allow starting it
      if (!trialCheck.hasStarted) {
        return {
          hasAccess: false,
          canStartTrial: true,
          needsActivation: false,
        };
      }

      // Trial expired or invalid, need license
      return {
        hasAccess: false,
        canStartTrial: false,
        needsActivation: true,
        reason: trialCheck.reason || "Access denied",
      };
    } catch (error) {
      console.error("Access check error:", error);
      return {
        hasAccess: false,
        canStartTrial: false,
        needsActivation: true,
        reason: error.message,
      };
    }
  }

  /**
   * Encrypt license data for storage
   */
  encryptLicenseData(data) {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  }

  /**
   * Decrypt license data from storage
   */
  decryptLicenseData(encrypted) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to decrypt license data:", error);
      return null;
    }
  }
}

// Export singleton instance
export const licenseService = new LicenseService();
