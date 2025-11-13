import { Op } from "sequelize";
import Setting from "../models/Setting.js";

/**
 * Setting Service
 * Handles all business logic for application settings
 */

class SettingService {
  /**
   * Create or update a setting
   * @param {string} key - Setting key
   * @param {string} value - Setting value
   * @param {Object} metadata - Optional metadata (category, description)
   * @returns {Promise<Object>} Created or updated setting
   */
  async setSetting(key, value, metadata = {}) {
    try {
      if (!key) {
        throw new Error("Setting key is required");
      }

      // Check if setting already exists
      let setting = await Setting.findOne({ where: { key } });

      if (setting) {
        // Update existing setting
        await setting.update({
          value,
          ...(metadata.category && { category: metadata.category }),
          ...(metadata.description && { description: metadata.description }),
        });
      } else {
        // Create new setting
        setting = await Setting.create({
          key,
          value,
          category: metadata.category || null,
          description: metadata.description || null,
        });
      }

      return {
        success: true,
        data: setting,
        message: "Setting saved successfully",
      };
    } catch (error) {
      console.error("Error setting value:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to save setting",
      };
    }
  }

  /**
   * Get a setting by key
   * @param {string} key - Setting key
   * @param {*} defaultValue - Default value if setting not found
   * @returns {Promise<Object>} Setting value
   */
  async getSetting(key, defaultValue = null) {
    try {
      if (!key) {
        throw new Error("Setting key is required");
      }

      const setting = await Setting.findOne({ where: { key } });

      if (!setting) {
        return {
          success: true,
          data: defaultValue,
          found: false,
        };
      }

      // Try to parse JSON values
      let value = setting.value;
      try {
        value = JSON.parse(value);
      } catch {
        // If not JSON, return as is
      }

      return {
        success: true,
        data: value,
        found: true,
        setting,
      };
    } catch (error) {
      console.error("Error getting setting:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to get setting",
        data: defaultValue,
      };
    }
  }

  /**
   * Get all settings
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of settings
   */
  async getAllSettings() {
    try {
      const settings = await Setting.findAll();
      return {
        success: true,
        data: settings.map((setting) => setting.toJSON()),
        count: settings.length,
      };
    } catch (error) {
      console.error("Error fetching settings:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch settings",
      };
    }
  }

  /**
   * Get settings by category
   * @param {string} category - Category name
   * @returns {Promise<Object>} Settings in category
   */
  async getSettingsByCategory(category) {
    try {
      if (!category) {
        throw new Error("Category is required");
      }

      const settings = await Setting.findAll({
        where: { category },
        order: [["key", "ASC"]],
      });

      // Convert to key-value object
      const settingsObject = {};
      settings.forEach((setting) => {
        let value = setting.value;
        try {
          value = JSON.parse(value);
        } catch {
          // If not JSON, use as is
        }
        settingsObject[setting.key] = value;
      });

      return {
        success: true,
        data: settingsObject,
        settings: settings.map((setting) => setting.toJSON()),
        count: settings.length,
      };
    } catch (error) {
      console.error("Error fetching settings by category:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch settings by category",
      };
    }
  }

  /**
   * Update a setting
   * @param {string} key - Setting key
   * @param {string} value - New value
   * @returns {Promise<Object>} Updated setting
   */
  async updateSetting(key, value) {
    try {
      if (!key) {
        throw new Error("Setting key is required");
      }

      const setting = await Setting.findOne({ where: { key } });
      if (!setting) {
        throw new Error("Setting not found");
      }

      await setting.update({ value });

      return {
        success: true,
        data: setting,
        message: "Setting updated successfully",
      };
    } catch (error) {
      console.error("Error updating setting:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update setting",
      };
    }
  }

  /**
   * Delete a setting
   * @param {string} key - Setting key
   * @returns {Promise<Object>} Deletion result
   */
  async deleteSetting(key) {
    try {
      if (!key) {
        throw new Error("Setting key is required");
      }

      const setting = await Setting.findOne({ where: { key } });
      if (!setting) {
        throw new Error("Setting not found");
      }

      await setting.destroy();

      return {
        success: true,
        message: "Setting deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting setting:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete setting",
      };
    }
  }

  /**
   * Set multiple settings at once
   * @param {Object} settings - Key-value pairs of settings
   * @param {string} category - Optional category for all settings
   * @returns {Promise<Object>} Result
   */
  async setMultipleSettings(settings, category = null) {
    try {
      if (!settings || typeof settings !== "object") {
        throw new Error("Settings must be an object");
      }

      const results = [];
      for (const [key, value] of Object.entries(settings)) {
        const stringValue =
          typeof value === "string" ? value : JSON.stringify(value);
        const result = await this.setSetting(key, stringValue, { category });
        results.push(result);
      }

      const allSuccess = results.every((r) => r.success);

      return {
        success: allSuccess,
        data: results,
        message: allSuccess
          ? "All settings saved successfully"
          : "Some settings failed to save",
      };
    } catch (error) {
      console.error("Error setting multiple settings:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to save settings",
      };
    }
  }

  /**
   * Get application configuration
   * @returns {Promise<Object>} Application configuration
   */
  async getAppConfig() {
    try {
      const settings = await Setting.findAll();

      const config = {};
      settings.forEach((setting) => {
        let value = setting.value;
        try {
          value = JSON.parse(value);
        } catch {
          // If not JSON, use as is
        }

        if (!config[setting.category]) {
          config[setting.category] = {};
        }

        config[setting.category][setting.key] = value;
      });

      return {
        success: true,
        data: config,
      };
    } catch (error) {
      console.error("Error fetching app config:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch application configuration",
      };
    }
  }

  /**
   * Initialize default settings
   * @returns {Promise<Object>} Result
   */
  async initializeDefaults() {
    try {
      const defaults = {
        // Office settings
        "office.name": "Law Office",
        "office.address": "",
        "office.phone": "",
        "office.email": "",
        "office.logo": "",

        // Invoice settings
        "invoice.prefix": "INV-",
        "invoice.taxRate": "19",
        "invoice.currency": "DZD",
        "invoice.paymentTerms": "30",

        // Case settings
        "case.prefix": "CASE-",

        // Notification settings
        "notification.appointmentReminder": "24",
        "notification.paymentReminder": "7",

        // Display settings
        "display.dateFormat": "DD/MM/YYYY",
        "display.language": "ar",
        "display.theme": "light",
      };

      const results = [];
      for (const [key, value] of Object.entries(defaults)) {
        // Only create if doesn't exist
        const existing = await Setting.findOne({ where: { key } });
        if (!existing) {
          const category = key.split(".")[0];
          const result = await this.setSetting(key, value, { category });
          results.push(result);
        }
      }

      return {
        success: true,
        data: results,
        message: "Default settings initialized",
      };
    } catch (error) {
      console.error("Error initializing defaults:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to initialize default settings",
      };
    }
  }

  /**
   * Export settings
   * @returns {Promise<Object>} Settings export
   */
  async exportSettings() {
    try {
      const settings = await Setting.findAll();

      const exportData = {};
      settings.forEach((setting) => {
        exportData[setting.key] = {
          value: setting.value,
          category: setting.category,
          description: setting.description,
        };
      });

      return {
        success: true,
        data: exportData,
      };
    } catch (error) {
      console.error("Error exporting settings:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to export settings",
      };
    }
  }

  /**
   * Import settings
   * @param {Object} importData - Settings to import
   * @returns {Promise<Object>} Result
   */
  async importSettings(importData) {
    try {
      if (!importData || typeof importData !== "object") {
        throw new Error("Import data must be an object");
      }

      const results = [];
      for (const [key, data] of Object.entries(importData)) {
        const result = await this.setSetting(key, data.value, {
          category: data.category,
          description: data.description,
        });
        results.push(result);
      }

      const allSuccess = results.every((r) => r.success);

      return {
        success: allSuccess,
        data: results,
        message: allSuccess
          ? "Settings imported successfully"
          : "Some settings failed to import",
      };
    } catch (error) {
      console.error("Error importing settings:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to import settings",
      };
    }
  }
}

export default new SettingService();
