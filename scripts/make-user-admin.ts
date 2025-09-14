import "dotenv/config";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function makeUserAdmin() {
  try {
    const email = process.argv[2] || "yadavsandeep@gmail.com";
    
    console.log(`Making user with email "${email}" an admin...`);
    
    // Find the user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      console.log(`❌ User with email "${email}" not found.`);
      console.log("Available users:");
      const allUsers = await db.select({ email: users.email, role: users.role }).from(users);
      allUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });
      process.exit(1);
    }

    if (existingUser.role === 'admin') {
      console.log(`✅ User "${email}" is already an admin!`);
      console.log("Admin credentials:");
      console.log(`  Email: ${existingUser.email}`);
      console.log(`  Username: ${existingUser.username}`);
      console.log("  Use your existing password to login to /admin");
      process.exit(0);
    }

    // Update user to admin
    const [updatedUser] = await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email))
      .returning();

    console.log("✅ User successfully promoted to admin!");
    console.log("Admin credentials:");
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Username: ${updatedUser.username}`);
    console.log(`  Role: ${updatedUser.role}`);
    console.log("");
    console.log("You can now access the admin panel at: http://localhost:5000/admin");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error making user admin:", error);
    process.exit(1);
  }
}

makeUserAdmin();