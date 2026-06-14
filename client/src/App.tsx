import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function App() {
  const { t, i18n } = useTranslation(['common', 'auth'])
  const [count, setCount] = useState(0)

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'ar' : 'en'
    i18n.changeLanguage(nextLang)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-lg p-6 space-y-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          {t('app_name')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('login_title', { ns: 'auth' })}
        </p>
        <div className="flex flex-col items-center justify-center gap-4">
          <button
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/95 transition duration-150 ease-in-out w-full"
            onClick={() => setCount((c) => c + 1)}
          >
            Count is {count}
          </button>
          
          <button
            type="button"
            className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground font-semibold rounded-md shadow transition duration-150 ease-in-out w-full"
            onClick={toggleLanguage}
          >
            {t('lang_toggle')}
          </button>

          <button
            type="button"
            className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground font-semibold rounded-md shadow transition duration-150 ease-in-out w-full"
            onClick={() => document.documentElement.classList.toggle('dark')}
          >
            {t('theme_toggle')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
