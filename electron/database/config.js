import { Sequelize } from 'sequelize';
import path from 'path';
import { app } from 'electron';

// Initialize SQLite database
const dbPath = path.join(app.getPath('userData'), 'law-office.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

// Initialize database
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

export { sequelize, initDatabase };
