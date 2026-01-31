/**
 * Script to update user plan for testing
 * Usage: npx tsx scripts/update-plan.ts <user-email> <plan-tier>
 * Example: npx tsx scripts/update-plan.ts user@example.com pro
 */

import "dotenv/config";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

type PlanTier = "free" | "starter" | "pro" | "organization";

async function updatePlan(email: string, planTier: PlanTier) {
  console.log(`Updating plan for ${email} to ${planTier}...`);

  try {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      console.error(`User with email ${email} not found!`);
      process.exit(1);
    }

    console.log(`Found user: ${user.id} (${user.email})`);
    console.log(`Current plan: ${user.planTier}`);

    // Calculate plan dates
    const planStartDate = new Date();
    const planEndDate =
      planTier === "organization"
        ? null
        : planTier === "free"
          ? null
          : new Date(planStartDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Update plan
    await db
      .update(users)
      .set({
        planTier: planTier,
        planStartDate: planStartDate,
        planEndDate: planEndDate,
      })
      .where(eq(users.id, user.id));

    console.log(`✅ Successfully updated plan to ${planTier}`);
    console.log(`   Plan start: ${planStartDate.toISOString()}`);
    console.log(`   Plan end: ${planEndDate ? planEndDate.toISOString() : "N/A"}`);

    // Verify update
    const [updatedUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    console.log(`\n✅ Verified: Current plan is now ${updatedUser.planTier}`);
  } catch (error) {
    console.error("Error updating plan:", error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: npx tsx scripts/update-plan.ts <user-email> <plan-tier>");
  console.error("Example: npx tsx scripts/update-plan.ts user@example.com pro");
  console.error("\nValid plan tiers: free, starter, pro, organization");
  process.exit(1);
}

const [email, planTier] = args;

if (!["free", "starter", "pro", "organization"].includes(planTier)) {
  console.error(`Invalid plan tier: ${planTier}`);
  console.error("Valid plan tiers: free, starter, pro, organization");
  process.exit(1);
}

updatePlan(email, planTier as PlanTier)
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
