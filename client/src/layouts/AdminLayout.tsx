import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'react-hot-toast'
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  HelpCircle,
  LogOut,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  Users,
  FileStack
} from 'lucide-react'

const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation(['admin'])
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'ar' : 'en'
    i18n.changeLanguage(nextLang)
    toast.success(nextLang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English')
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('role')
    toast.success(i18n.language.startsWith('en') ? 'Signed out successfully' : 'تم تسجيل الخروج بنجاح')
    navigate('/login')
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/admin') return t('overview')
    if (path === '/admin/users') return t('users control')
    if (path === '/admin/stacks') return t('stacks control')
    if (path === '/admin/sessions') return t('session logs')
    return t('sessions')
  }

  const menuItems = [
    { label: t('overview'), path: '/admin',  icon: LayoutDashboard  },
    { label: t('users control'), path: '/admin/users', icon: Users },
    { label: t('stack settings'), path: '/admin/stacks', icon: FileStack  },
    { label: t('session logs'), path: '/admin/sessions', icon: Calendar  }
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-900 w-full p-5 justify-between">
      {/* Top Branding Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none tracking-tight">Elevate</h2>
            <span className="text-xs text-slate-400 font-medium"></span>
          </div>
        </div>

        {/* Main Navigation Menu */}
        <nav className="space-y-1 pt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-5">
        {/* Upgrade Plan Box */}
        

        {/* Footer actions */}
        <div className="space-y-1">
          <Link
            to="/student/support"
            onClick={() => {
              setMobileSidebarOpen(false)
              toast('Support center coming soon!', { icon: '💬' })
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all"
          >
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span>{t('support')}</span>
          </Link>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all"
          >
            <LogOut className="w-5 h-5 text-rose-400" />
            <span>{t('sign_out')}</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1329] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-300">
      {/* Desktop Sidebar - Left in LTR, Right in RTL */}
      <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          
          {/* Drawer container */}
          <div className="relative w-80 max-w-[85vw] h-full flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/50"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-white dark:bg-[#0d162e] border-b border-slate-200 dark:border-slate-800/60 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur bg-white/95 dark:bg-[#0d162e]/95">
          <div className="flex items-center gap-4">
            {/* Hamburger Button for mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Switch Language"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden md:inline">{i18n.language.startsWith('en') ? 'العربية' : 'English'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => toast('No new notifications', { icon: '🔔' })}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-all relative"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            </button>

            {/* Help */}
            <button
              onClick={() => toast('Help documentation coming soon!', { icon: 'ℹ️' })}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-all hidden sm:block"
              title="Help Center"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>

            
          </div>
        </header>

        {/* Dynamic Outlet Page Content Pane */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          
          <div className="relative bg-white dark:bg-[#0e1730] border border-slate-200 dark:border-slate-850/80 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl z-10 p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">
              {t('logout_confirm_title')}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {t('logout_confirm_desc')}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 font-bold rounded-xl py-3 text-xs transition-colors border border-transparent dark:border-slate-800/40"
              >
                {t('logout_cancel_btn')}
              </button>

              <button
                onClick={() => {
                  setShowLogoutModal(false)
                  handleLogout()
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-3 text-xs shadow-lg shadow-rose-600/10 transition-colors"
              >
                {t('logout_confirm_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLayout
