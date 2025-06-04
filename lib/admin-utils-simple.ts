/**
 * Admin utilities for checking admin status across the application
 */

import { clerkClient } from "@clerk/nextjs/server";

// Admin email - in production, this should be moved to environment variables
export const ADMIN_EMAIL = "admin@pathbreakers.com";

/**
 * Check if a user is an admin based on userId
 * Simple implementation that just checks if the email matches the admin email
 */
export async function isUserAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) {
    return false;
  }
  
  try {
    // Get user details from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    // Check if user exists and has a valid email
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return false;
    }
    
    // Simple check if any of the user's email addresses match the admin email
    const isAdminEmail = user.emailAddresses.some(
      email => email.emailAddress === ADMIN_EMAIL && email.verification?.status === 'verified'
    );
    
    return isAdminEmail;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
