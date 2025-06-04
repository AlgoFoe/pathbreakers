import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api-admin-auth";

/**
 * Example admin-only API route
 * This endpoint is protected by the admin authentication middleware
 */

export async function GET(req: NextRequest) {
  // First check admin authorization
  const authResult = await withAdminAuth();
  if (authResult) return authResult; // Return error response if not authorized
  
  // Continue with admin-only functionality
  return NextResponse.json({
    message: "Admin access granted",
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  // First check admin authorization
  const authResult = await withAdminAuth();
  if (authResult) return authResult; // Return error response if not authorized
  
  // Continue with admin-only functionality
  try {
    const data = await req.json();
    
    return NextResponse.json({
      message: "Admin action executed successfully",
      received: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
