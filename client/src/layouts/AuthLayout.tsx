import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Globe, Sun, Moon } from 'lucide-react'

const AuthLayout: React.FC = () => {
  const { t, i18n } = useTranslation(['common'])
  const { theme, toggleTheme } = useTheme()

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'ar' : 'en'
    i18n.changeLanguage(nextLang)
  }

  const isRtl = i18n.language.startsWith('ar')

  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-hidden" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none"></div>

     
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-50 relative">
        
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-primary transition hover:opacity-90">
          <span className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-extrabold text-base shadow-lg shadow-primary/20">
            E
          </span>
          <span className="tracking-tight">{t('app_name')}</span>
        </Link>

       
        <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md border border-border/40 px-3 py-1.5 rounded-full shadow-sm">
         
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage} 
            className="rounded-full gap-1.5 px-3 py-1 h-8 text-xs font-semibold hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-250"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{i18n.language.toUpperCase().substring(0, 2)}</span>
          </Button>

          <div className="w-[1px] h-4 bg-border/60"></div>

       
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-8 h-8 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-250"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </Button>
        </div>
      </header>

      
      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout
