import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'mentor' | 'admin')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  // Mock authentication check - checks localStorage for tokens
  const token = localStorage.getItem('accessToken')
  const userRole = localStorage.getItem('role') as 'student' | 'mentor' | 'admin' | null

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
