/**
 * API route utilities for admin-only routes
 */

import { auth } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/admin-utils-simple";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware wrapper for admin-only API routes
 * Usage example:
 * 
 * export async function POST(req: NextRequest) {
 *   // Check admin authorization first
 *   const authResult = await withAdminAuth();
 *   if (authResult) return authResult; // Return error response if not authorized
 * 
 *   // Continue with admin-only functionality
 *   // ...
 * }
 */
export async function withAdminAuth(): Promise<NextResponse | null> {
  const { userId } = auth();
  
  // Check if user is authenticated
  if (!userId) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // Simple check if user is admin - just check if email matches admin email
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden - Admin access required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // If user is authenticated and has admin privileges, return null to continue
  return null;
}

/**
 * Check if the request is from an authenticated admin
 * Used in API routes that need to validate admin access
 * 
 * @param req NextRequest object
 * @returns boolean indicating if the request is from an admin
 */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  // Check for admin auth cookie
  const adminAuthCookie = req.cookies.get('admin-auth');
  
  // Return true if the admin auth cookie exists and has the correct value
  return !!adminAuthCookie && adminAuthCookie.value === 'true';
}
