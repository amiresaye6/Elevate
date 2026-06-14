import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation(['common'])
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const token = localStorage.getItem('accessToken')
  const userRole = localStorage.getItem('role')

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'ar' : 'en'
    i18n.changeLanguage(nextLang)
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-extrabold text-sm">E</span>
          <span>{t('app_name')}</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-semibold">
          <Button variant="ghost" asChild>
            <Link to="/">{t('nav.home')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/mentors">{t('nav.find_mentors')}</Link>
          </Button>
          {token && (
            <>
              {userRole === 'student' && (
                <Button variant="ghost" asChild>
                  <Link to="/student/dashboard">{t('nav.student_dashboard')}</Link>
                </Button>
              )}
              {userRole === 'mentor' && (
                <Button variant="ghost" asChild>
                  <Link to="/mentor/dashboard">{t('nav.mentor_dashboard')}</Link>
                </Button>
              )}
              {userRole === 'admin' && (
                <Button variant="ghost" asChild>
                  <Link to="/admin">{t('nav.admin_dashboard')}</Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link to="/profile">{t('nav.profile')}</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={toggleLanguage}>
            {t('lang_toggle')}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </Button>

          {token ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="font-bold uppercase">
                    {userRole}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">{t('nav.profile_settings')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive font-semibold">
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button asChild>
                <Link to="/register">{t('nav.register')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
