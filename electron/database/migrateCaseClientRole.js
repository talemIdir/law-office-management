import { sequelize } from "./config.js";

/**
 * Migration script to update the clientRole enum in the Case table
 * Adds new options: intervening_party, respondent_after_expertise,
 * appellant_after_expertise, appellant, respondent
 */
async function migrateCaseClientRole() {
  try {
    console.log("🔄 Starting Case clientRole migration...\n");

    // Connect to database
    await sequelize.authenticate();
    console.log("✓ Connected to database");

    // SQLite doesn't support ALTER COLUMN for enums directly
    // We need to use a workaround by creating a new table and copying data
    const queryInterface = sequelize.getQueryInterface();

    console.log("📊 Updating Case table schema...");

    // For SQLite, we need to manually alter the table structure
    // This is a simplified approach that works with Sequelize's sync
    await sequelize.query(`
      -- Create a temporary table with the new schema
      CREATE TABLE IF NOT EXISTS cases_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caseNumber VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        caseType VARCHAR(255) NOT NULL,
        jurisdictionType VARCHAR(255),
        judicialCouncilId INTEGER,
        administrativeAppealCourtId INTEGER,
        courtId INTEGER,
        courtName VARCHAR(255),
        judge VARCHAR(255),
        opposingParty VARCHAR(255),
        opposingLawyer VARCHAR(255),
        clientRole VARCHAR(255) NOT NULL CHECK(clientRole IN ('plaintiff', 'defendant', 'intervening_party', 'respondent_after_expertise', 'appellant_after_expertise', 'appellant', 'respondent')),
        status VARCHAR(255) DEFAULT 'first_instance',
        priority VARCHAR(255) DEFAULT 'medium',
        startDate DATE,
        endDate DATE,
        amount DECIMAL(15,2),
        notes TEXT,
        clientId INTEGER,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        FOREIGN KEY (clientId) REFERENCES clients(id)
      );
    `);

    // Check if the old table exists
    const tables = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='cases'",
      { type: sequelize.QueryTypes.SELECT }
    );

    if (tables.length > 0) {
      console.log("✓ Found existing cases table");

      // Copy data from old table to new table
      await sequelize.query(`
        INSERT INTO cases_new
        SELECT * FROM cases;
      `);

      console.log("✓ Data copied to new table");

      // Drop old table
      await sequelize.query("DROP TABLE cases;");
      console.log("✓ Old table dropped");

      // Rename new table
      await sequelize.query("ALTER TABLE cases_new RENAME TO cases;");
      console.log("✓ New table renamed");
    } else {
      console.log("ℹ No existing cases table found, will be created on next sync");
      await sequelize.query("DROP TABLE IF EXISTS cases_new;");
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📝 New clientRole options available:");
    console.log("   - plaintiff (مدعي)");
    console.log("   - defendant (مدعى عليه)");
    console.log("   - intervening_party (مدخل في الخصام)");
    console.log("   - respondent_after_expertise (مرجع بعد الخبرة)");
    console.log("   - appellant_after_expertise (مرجع عليه بعد الخبرة)");
    console.log("   - appellant (الطاعن)");
    console.log("   - respondent (المطعون ضده)\n");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.error("\nℹ If the error persists, you may need to:");
    console.error("   1. Backup your database");
    console.error("   2. Use the alter: true option in sequelize.sync()");
    console.error("   3. Or manually update the database schema\n");
  } finally {
    await sequelize.close();
  }
}

migrateCaseClientRole();
