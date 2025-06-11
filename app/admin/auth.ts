"use server";

import { cookies } from "next/headers";


const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@pathbreakers.com";
const ADMIN_PASSWORD = process.env.ADMIN_EMAIL || "admin123"; 

export async function authenticateAdmin(email: string, password: string) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    cookies().set('admin-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    
    return {
      authenticated: true,
      user: {
        email: ADMIN_EMAIL,
        role: "admin",
        name: "Admin User"
      }
    };
  }
  
  return {
    authenticated: false,
    error: "Invalid email or password"
  };
}

export async function checkAdminAuth() {
  const adminCookie = cookies().get('admin-auth');
  return adminCookie?.value === 'true';
}

export async function isAdmin() {
  const isAuthenticated = await checkAdminAuth();
  return {
    isAdmin: isAuthenticated
  };
}

export async function logoutAdmin() {
  cookies().delete('admin-auth');
  return true;
}
