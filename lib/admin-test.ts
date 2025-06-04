/**
 * Simple admin test utility
 * Use this to test that admin route protection is working correctly
 */

import { isUserAdmin } from "./admin-utils-simple";
import { auth } from "@clerk/nextjs/server";

/**
 * Check if the current user is an admin
 * Returns a simple object indicating admin status
 */
export async function testAdminStatus() {
  const { userId } = auth();
  
  if (!userId) {
    return { 
      status: 'unauthenticated',
      isAdmin: false,
      message: 'User is not authenticated'
    };
  }
  
  const isAdmin = await isUserAdmin(userId);
  
  return {
    status: 'authenticated',
    isAdmin,
    message: isAdmin 
      ? 'User is authenticated and has admin access' 
      : 'User is authenticated but does not have admin access'
  };
}

/**
 * Steps to test admin route protection:
 * 
 * 1. Logout completely:
 *    - Click logout in admin panel
 *    - Verify you're redirected to login page
 *    - Try to access /admin/dashboard - should redirect to login
 * 
 * 2. Login with non-admin user:
 *    - Login with an account that doesn't use admin@pathbreakers.com
 *    - Try to access /admin/dashboard - should redirect to login
 * 
 * 3. Login with admin user:
 *    - Login with the admin@pathbreakers.com account
 *    - Try to access /admin/dashboard - should succeed
 *    - Try to access /admin/debug - should show "Admin access confirmed"
 * 
 * 4. Test API protection:
 *    - While logged out: fetch('/api/admin/debug') - should return 401
 *    - While logged in as non-admin: fetch('/api/admin/debug') - should return 403
 *    - While logged in as admin: fetch('/api/admin/debug') - should return isAdmin: true
 */
