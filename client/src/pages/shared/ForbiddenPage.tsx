import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation(['common'])

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full text-center p-6 border border-border shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-8xl font-extrabold text-destructive tracking-widest">403</CardTitle>
          <div className="mx-auto w-fit bg-destructive/10 text-destructive px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider">
            {t('errors.forbidden_subtitle')}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground">
            {t('errors.forbidden_description')}
          </CardDescription>
        </CardContent>
        <CardFooter className="justify-center gap-4">
          <Button asChild>
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">{t('errors.go_home')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ForbiddenPage
