import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  try {
    console.log("Creating admin user...");
    
    const adminData = {
      username: "admin",
      email: "yadavsandeep6004@gmail.com",
      password: await bcrypt.hash("admin@123", 10),
      role: "admin" as const
    };

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminData.email))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("❌ Admin user already exists with email:", adminData.email);
      console.log("Admin credentials:");
      console.log("  Email: yadavsandeep6004@gmail.com");
      console.log("  Password: admin@123");
      process.exit(0);
    }

    const [admin] = await db.insert(users).values(adminData).returning();
    
    console.log("✅ Admin user created successfully!");
    console.log("Admin credentials:");
    console.log("  Email:", admin.email);
    console.log("  Username:", admin.username);
    console.log("  Password: admin123");
    console.log("  Role:", admin.role);
    console.log("");
    console.log("You can now login to the admin panel at: http://localhost:5000/admin");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();