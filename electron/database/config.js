import { Sequelize } from "sequelize";
import path from "path";
//import { app } from "electron";
import fs from "fs";

/**
 * Get the custom data directory path selected during installation
 * Returns null if not found or in development mode
 */
function getCustomDataPath() {
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  try {
    const appDataPath = app.getPath("appData");
    const configPath = path.join(
      appDataPath,
      "law-office-management",
      "data-path.txt"
    );

    if (fs.existsSync(configPath)) {
      const dataPath = fs.readFileSync(configPath, "utf8").trim();
      if (dataPath && fs.existsSync(dataPath)) {
        console.log("Using custom data directory:", dataPath);
        return dataPath;
      }
    }
  } catch (error) {
    console.warn("Could not read custom data path:", error);
  }

  return null;
}

/**
 * Get the path to the SQLite database file
 * In development: uses project root
 * In production: uses custom data directory (if set) or app data directory
 */
function getDatabasePath(dbName = "law-office.db") {
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), dbName);
  }

  // Try to use custom data directory first
  const customDataPath = getCustomDataPath();
  if (customDataPath) {
    return path.join(customDataPath, dbName);
  }

  // Fallback to app data directory
  try {
    const userDataPath = app.getPath("userData");
    return path.join(userDataPath, dbName);
  } catch (error) {
    console.warn("Could not access app data directory:", error);
    return path.join(process.cwd(), dbName);
  }
}

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: getDatabasePath("law-office.db"),
  logging: false,
});

// Initialize database
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync all models
    await sequelize.sync({ alter: false });
    console.log("Database synchronized successfully.");

    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return false;
  }
}

export { sequelize, initDatabase };
