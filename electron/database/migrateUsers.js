import { sequelize } from "./config.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

async function migrateUsers() {
  try {
    console.log("🔄 Starting user migration...\n");

    // Connect to database
    await sequelize.authenticate();
    console.log("✓ Connected to database");

    // Force sync to update the enum
    await User.sync({ force: true });
    console.log("✓ User table recreated with new schema\n");

    // Create default admin user
    console.log("👤 Creating default admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      username: "admin",
      password: hashedPassword,
      fullName: "المدير",
      email: "admin@lawoffice.dz",
      role: "admin",
      phone: "0555123456",
      status: "active",
    });

    console.log("✓ Admin user created successfully");
    console.log("\n🔐 Login Credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123\n");

    console.log("✅ Migration completed successfully!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await sequelize.close();
  }
}

migrateUsers();
