import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/admin-utils-simple";

/**
 * Simple Admin Status Check Endpoint
 * This endpoint simply returns whether the current user is an admin or not
 */

export async function GET(req: NextRequest) {
  const { userId } = auth();
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json(
      { isAdmin: false, authenticated: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
  
  try {
    // Simple check if user is admin
    const isAdmin = await isUserAdmin(userId);
    
    return NextResponse.json({
      isAdmin,
      authenticated: true,
      message: isAdmin ? "User is an admin" : "User is not an admin"
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { isAdmin: false, authenticated: true, error: "Error checking admin status" },
      { status: 500 }
    );
  }
}
