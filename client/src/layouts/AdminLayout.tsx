import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from '../components/layouts/Navbar'
import { Footer } from '../components/layouts/Footer'
import { Button } from '@/components/ui/button'

const AdminLayout: React.FC = () => {
  const { t } = useTranslation(['admin'])
  const location = useLocation()

  const navItems = [
    { label: t('overview'), path: '/admin' },
    { label: t('users_control'), path: '/admin/users' },
    { label: t('stack_settings'), path: '/admin/stacks' },
    { label: t('session_logs'), path: '/admin/sessions' }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar navigation */}
          <aside className="w-full md:w-64 bg-card border border-border rounded-xl p-4 h-fit space-y-2">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('portal_header')}
            </h3>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm font-semibold"
                    asChild
                  >
                    <Link to={item.path}>
                      {item.label}
                    </Link>
                  </Button>
                )
              })}
            </nav>
          </aside>

          {/* Main child content area */}
          <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm min-h-[50vh]">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AdminLayout
