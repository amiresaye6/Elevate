import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export const Footer: React.FC = () => {
  const { t } = useTranslation(['common'])

  return (
    <footer className="border-t border-border bg-card py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {t('app_name')}. {t('footer.all_rights_reserved')}</p>
        <div className="flex gap-4">
          <Button variant="link" asChild className="text-muted-foreground p-0 h-auto">
            <Link to="/">{t('nav.home')}</Link>
          </Button>
          <Button variant="link" asChild className="text-muted-foreground p-0 h-auto">
            <Link to="/mentors">{t('nav.find_mentors')}</Link>
          </Button>
        </div>
      </div>
    </footer>
  )
}
