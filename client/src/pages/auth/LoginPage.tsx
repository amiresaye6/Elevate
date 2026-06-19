import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../../store'
import { setCredentials } from '../../store/slices/authSlice'
import authService from '../../services/authService'
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { LoginSchema } from '../../types/auth'

const LoginPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = LoginSchema.safeParse({ email, password })
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || 'Invalid input data.'
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.login({ email, password })
      if (res.success && res.data) {
        const { accessToken, user } = res.data
        const role = user.role.toLowerCase() as 'student' | 'mentor' | 'admin'

        dispatch(setCredentials({ accessToken, user, role }))
        toast.success(res.message || 'Login successful!')

        if (role === 'student') navigate('/student/dashboard')
        else if (role === 'mentor') navigate('/mentor/dashboard')
        else if (role === 'admin') navigate('/admin')
        else navigate('/')
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid email or password.'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1234/api'
    const rootUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
    window.location.href = `${rootUrl}/auth/google`
  }

  return (
    <>
      <style>{`
        .login-page {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          box-sizing: border-box;
        }
        .login-wrapper {
          width: 460px;
          max-width: 100%;
          position: relative;
        }
        .login-glow {
          position: absolute;
          inset: -8px;
          border-radius: 22px;
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, #6366f1 100%);
          filter: blur(22px);
          opacity: 0.18;
          pointer-events: none;
          transition: opacity 0.4s;
        }
        .login-wrapper:hover .login-glow {
          opacity: 0.26;
        }
        .login-card {
          position: relative;
          background: hsl(var(--card) / 0.7);
          backdrop-filter: blur(24px);
          border: 1px solid hsl(var(--border));
          border-radius: 20px;
          padding: 2.75rem 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2);
          box-sizing: border-box;
        }
        .login-title {
          text-align: center;
        }
        .login-title h1 {
          font-size: 1.875rem;
          font-weight: 800;
          background: linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.35rem;
        }
        .login-title p {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .login-field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .login-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .login-forgot {
          font-size: 0.75rem;
          font-weight: 600;
          color: hsl(var(--primary));
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .login-forgot:hover {
          opacity: 0.75;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-icon {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0.75rem;
          display: flex;
          align-items: center;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: hsl(var(--background) / 0.6);
          border: 1px solid hsl(var(--border));
          border-radius: 12px;
          outline: none;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .login-input::placeholder {
          color: hsl(var(--muted-foreground) / 0.6);
        }
        .login-input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
        }
        .login-input-pw {
          padding-right: 2.75rem;
        }
        .login-eye {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0.75rem;
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          color: hsl(var(--muted-foreground));
          padding: 0;
          transition: color 0.2s;
        }
        .login-eye:hover {
          color: hsl(var(--foreground));
        }
        .login-submit {
          width: 100%;
          padding: 0.85rem;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: none;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 14px hsl(var(--primary) / 0.3);
          transition: all 0.2s;
        }
        .login-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px hsl(var(--primary) / 0.35);
        }
        .login-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .login-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .login-divider-line {
          flex: 1;
          height: 1px;
          background: hsl(var(--border));
        }
        .login-divider-text {
          font-size: 0.72rem;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .login-google-btn {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid hsl(var(--border));
          border-radius: 12px;
          background: hsl(var(--background) / 0.5);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          color: hsl(var(--foreground));
          transition: all 0.2s;
        }
        .login-google-btn:hover {
          background: hsl(var(--muted) / 0.6);
          transform: translateY(-1px);
        }
        .login-footer {
          text-align: center;
          font-size: 0.82rem;
          color: hsl(var(--muted-foreground));
          font-weight: 600;
        }
        .login-footer a {
          color: hsl(var(--primary));
          text-decoration: none;
          margin-left: 0.25rem;
        }
        .login-footer a:hover {
          text-decoration: underline;
        }
        .login-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid hsl(var(--primary-foreground));
          border-top-color: transparent;
          border-radius: 50%;
          animation: loginSpin 0.7s linear infinite;
        }
        @keyframes loginSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="login-page">
        <div className="login-wrapper">
          <div className="login-glow" />

          <div className="login-card">
            {/* Header */}
            <div className="login-title">
              <h1>{t('login_title')}</h1>
              <p>{t('login_subtitle')}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="login-field">
                <label className="login-label">{t('email')}</label>
                <div className="login-input-wrap">
                  <span className="login-icon"><Mail size={16} /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="login-input"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <div className="login-field-header">
                  <label className="login-label">{t('password')}</label>
                  <Link
                    to="/forgot-password"
                    className="login-forgot"
                  >
                    {t('forgot_password')}
                  </Link>
                </div>
                <div className="login-input-wrap">
                  <span className="login-icon"><Lock size={16} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="login-input login-input-pw"
                    required
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="login-submit">
                {isLoading ? (
                  <div className="login-spinner" />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>{t('sign_in')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">{t('or_continue_with')}</span>
              <div className="login-divider-line" />
            </div>

            {/* Google */}
            <button type="button" onClick={handleGoogleLogin} className="login-google-btn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{t('google_sign_in')}</span>
            </button>

            {/* Footer */}
            <div className="login-footer">
              {t('no_account')}
              <Link to="/register">
                {t('sign_up')} <ArrowRight style={{ display: 'inline', verticalAlign: 'middle', width: 14, height: 14 }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
