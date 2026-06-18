/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'

// Import structural layouts
import StudentLayout from '../layouts/StudentLayout'
import MentorLayout from '../layouts/MentorLayout'
import AdminLayout from '../layouts/AdminLayout'

// Error & Fallback pages
const NotFoundPage = lazy(() => import('../pages/shared/NotFoundPage'))
const ForbiddenPage = lazy(() => import('../pages/shared/ForbiddenPage'))
const ServerErrorPage = lazy(() => import('../pages/shared/ServerErrorPage'))

// Auth & Profile pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'))
const LoginSuccessPage = lazy(() => import('../pages/auth/LoginSuccessPage'))
const ProfilePage = lazy(() => import('../pages/shared/ProfilePage'))

// Loading indicator component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
  </div>
)

/* 
 * NOTE TO TEAM MEMBERS:
 * When you implement a page component:
 * 1. Create the page file (e.g. src/pages/auth/LoginPage.tsx)
 * 2. Import it dynamically using lazy import:
 *    `const LoginPage = lazy(() => import('../pages/auth/LoginPage'))`
 * 3. Replace `<NotFoundPage />` with your imported page component in the routes configuration below.
 */

export const router = createBrowserRouter([
  // 1. General & Public Routes (wrapped in MainLayout)
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundPage /> {/* Replace with <LandingPage /> when implemented */}
          </Suspense>
        ),
      },
      {
        path: 'mentors',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundPage /> {/* Replace with <MentorDiscoveryPage /> when implemented */}
          </Suspense>
        ),
      },
      {
        path: 'mentor/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
      
      // Public Error page routes
      {
        path: '403',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ForbiddenPage />
          </Suspense>
        ),
      },
      {
        path: '500',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ServerErrorPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },

  // 2. Authentication Routes (wrapped in AuthLayout)
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'auth/login-success',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginSuccessPage />
          </Suspense>
        ),
      },
    ],
  },

  // 2. Student Portal Routes (guarded and wrapped in StudentLayout)
  {
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          {
            path: 'student/dashboard',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage /> {/* Replace with <StudentDashboardPage /> when implemented */}
              </Suspense>
            ),
          },
          {
            path: 'student/sessions',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage /> {/* Replace with <SessionHistoryPage /> when implemented */}
              </Suspense>
            ),
          },
          {
            path: 'profile', // Accessible here so student stays inside StudentLayout
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // 3. Mentor Portal Routes (guarded and wrapped in MentorLayout)
  {
    element: <ProtectedRoute allowedRoles={['mentor']} />,
    children: [
      {
        element: <MentorLayout />,
        children: [
          {
            path: 'mentor/dashboard',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage /> {/* Replace with <MentorDashboardPage /> when implemented */}
              </Suspense>
            ),
          },
          {
            path: 'mentor/availability',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage /> {/* Replace with <AvailabilityManagementPage /> when implemented */}
              </Suspense>
            ),
          },
          {
            path: 'mentor/sessions',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage /> {/* Replace with <SessionManagementPage /> when implemented */}
              </Suspense>
            ),
          },
          {
            path: 'profile', // Accessible here so mentor stays inside MentorLayout
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // 4. Admin Portal Routes (guarded and wrapped in AdminLayout)
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'admin',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage /> {/* Replace with <AdminDashboardPage /> when implemented */}
              </Suspense>
            ),
          },
          {
            path: 'admin/users',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage /> {/* Replace with <UserManagementPage /> when implemented */}
              </Suspense>
            ),
          },
          {
            path: 'admin/stacks',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage /> {/* Replace with <StackManagementPage /> when implemented */}
              </Suspense>
            ),
          },
          {
            path: 'admin/sessions',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage /> {/* Replace with <SessionMonitoringPage /> when implemented */}
              </Suspense>
            ),
          },
          {
            path: 'profile', // Accessible here so admin stays inside AdminLayout
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
])
