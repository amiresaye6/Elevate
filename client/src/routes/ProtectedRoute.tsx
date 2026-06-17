import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'mentor' | 'admin')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  // Mock authentication check - checks localStorage for tokens
  let token = localStorage.getItem('accessToken')
  let userRole = localStorage.getItem('role') as 'student' | 'mentor' | 'admin' | null

  // Auto-login for development testing
  if (!token) {
    localStorage.setItem('accessToken', 'mock-student-token')
    localStorage.setItem('role', 'student')
    token = 'mock-student-token'
    userRole = 'student'
  }

  if (!token) {
    // Redirect to login if unauthenticated
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    // Redirect to Forbidden page if authorized role mismatch
    return <Navigate to="/403" replace />
  }

  // Render children routes
  return <Outlet />
}
