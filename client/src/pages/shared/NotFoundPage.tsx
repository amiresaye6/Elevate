import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation(['common'])

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full text-center p-6 border border-border shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-8xl font-extrabold text-primary tracking-widest">404</CardTitle>
          <div className="mx-auto w-fit bg-primary/10 text-primary px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider">
            {t('errors.not_found_subtitle')}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground">
            {t('errors.not_found_description')}
          </CardDescription>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link to="/">{t('errors.go_back_home')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default NotFoundPage
