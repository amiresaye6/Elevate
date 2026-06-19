import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import authService from '../../services/authService'
import { Mail, Lock, Eye, EyeOff, User, UserPlus, DollarSign, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { RegisterSchema } from '../../types/auth'

interface Stack {
  id: number
  name: string
  description: string
}

const RegisterPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'STUDENT' | 'MENTOR'>('STUDENT')

  const [title, setTitle] = useState('')
  const [hourlyRate, setHourlyRate] = useState<number>(0)
  const [stackId, setStackId] = useState<number | ''>('')
  const [stacks, setStacks] = useState<Stack[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchStacks = async () => {
      try {
        const res = await api.get('/stacks')
        setStacks(res.data || [])
      } catch (err) {
        console.error('Failed to fetch stacks', err)
      }
    }
    fetchStacks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payloadData: any = { name, email, password, role }
    if (role === 'MENTOR') {
      payloadData.title = title
      payloadData.hourlyRate = Number(hourlyRate)
      payloadData.stackId = stackId !== '' ? Number(stackId) : ''
    }

    const result = RegisterSchema.safeParse(payloadData)
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || 'Invalid registration details.'
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)
    try {
      const payload: any = { name, email, password, role }
      if (role === 'MENTOR') {
        payload.title = title
        payload.hourlyRate = Number(hourlyRate)
        payload.stackId = Number(stackId)
      }
      const res = await authService.register(payload)
      if (res.success) {
        toast.success(res.message || 'Registration successful! Please login.')
        navigate('/login')
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to register account.'
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
        .reg-page {
          min-height: calc(80vh - 60px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          box-sizing: border-box;
        }
        .reg-wrapper {
          width: 550px;
          max-width: 100%;
          position: relative;
        }
        .reg-glow {
          position: absolute;
          inset: -8px;
          border-radius: 22px;
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, #6366f1 100%);
          filter: blur(22px);
          opacity: 0.18;
          pointer-events: none;
          transition: opacity 0.4s;
        }
        .reg-wrapper:hover .reg-glow {
          opacity: 0.26;
        }
        .reg-card {
          position: relative;
          background: hsl(var(--card) / 0.7);
          backdrop-filter: blur(24px);
          border: 1px solid hsl(var(--border));
          border-radius: 20px;
          padding: 2.25rem 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2);
          box-sizing: border-box;
        }
        .reg-title {
          text-align: center;
        }
        .reg-title h1 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.35rem;
        }
        .reg-title p {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
        }
        .reg-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.375rem;
          padding: 0.375rem;
          background: hsl(var(--muted));
          border-radius: 12px;
          border: 1px solid hsl(var(--border));
        }
        .reg-tab {
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: hsl(var(--muted-foreground));
        }
        .reg-tab.active {
          background: hsl(var(--background));
          color: hsl(var(--primary));
          box-shadow: 0 1px 6px rgba(0,0,0,0.12);
        }
        .reg-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .reg-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .reg-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .reg-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .reg-input-wrap {
          position: relative;
        }
        .reg-icon {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0.75rem;
          display: flex;
          align-items: center;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        .reg-input {
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
        .reg-input::placeholder {
          color: hsl(var(--muted-foreground) / 0.6);
        }
        .reg-input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
        }
        .reg-input-pw {
          padding-right: 2.75rem;
        }
        .reg-pw-toggle {
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
        }
        .reg-mentor-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid hsl(var(--border));
          animation: regFadeIn 0.25s ease;
        }
        .reg-select {
          width: 100%;
          padding: 0.75rem 1rem;
          background: hsl(var(--background) / 0.6);
          border: 1px solid hsl(var(--border));
          border-radius: 12px;
          outline: none;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          appearance: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .reg-select:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
        }
        .reg-textarea {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: hsl(var(--background) / 0.6);
          border: 1px solid hsl(var(--border));
          border-radius: 12px;
          outline: none;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          resize: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .reg-textarea:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
        }
        .reg-submit {
          margin-top: 0.5rem;
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
        .reg-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px hsl(var(--primary) / 0.35);
        }
        .reg-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .reg-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .reg-divider-line {
          flex: 1;
          height: 1px;
          background: hsl(var(--border));
        }
        .reg-divider-text {
          font-size: 0.72rem;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .reg-google-btn {
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
        .reg-google-btn:hover {
          background: hsl(var(--muted) / 0.6);
          transform: translateY(-1px);
        }
        .reg-footer {
          text-align: center;
          font-size: 0.82rem;
          color: hsl(var(--muted-foreground));
          font-weight: 600;
        }
        .reg-footer a {
          color: hsl(var(--primary));
          text-decoration: none;
          margin-left: 0.25rem;
        }
        .reg-footer a:hover {
          text-decoration: underline;
        }
        .reg-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid hsl(var(--primary-foreground));
          border-top-color: transparent;
          border-radius: 50%;
          animation: regSpin 0.7s linear infinite;
        }
        @keyframes regSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes regFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="reg-page">
        <div className="reg-wrapper">
          <div className="reg-glow" />

          <div className="reg-card">
            {/* Header */}
            <div className="reg-title">
              <h1>{t('register_title')}</h1>
              <p>{t('register_subtitle')}</p>
            </div>

            {/* Role Tabs */}
            <div className="reg-tabs">
              {(['STUDENT', 'MENTOR'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`reg-tab${role === r ? ' active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {t(r === 'STUDENT' ? 'student' : 'mentor')}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="reg-form">

              {/* Row 1: Name + Email */}
              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-label">{t('name')}</label>
                  <div className="reg-input-wrap">
                    <span className="reg-icon"><User size={16} /></span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="reg-input"
                      required
                    />
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-label">{t('email')}</label>
                  <div className="reg-input-wrap">
                    <span className="reg-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="reg-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="reg-field">
                <label className="reg-label">{t('password')}</label>
                <div className="reg-input-wrap">
                  <span className="reg-icon"><Lock size={16} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="reg-input reg-input-pw"
                    required
                  />
                  <button
                    type="button"
                    className="reg-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Mentor Fields */}
              {role === 'MENTOR' && (
                <div className="reg-mentor-section">
                  {/* Title + Stack */}
                  <div className="reg-row">
                    <div className="reg-field">
                      <label className="reg-label">{t('mentor_title')}</label>
                      <div className="reg-input-wrap">
                        <span className="reg-icon"><Briefcase size={16} /></span>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Senior Frontend Engineer"
                          className="reg-input"
                          required={role === 'MENTOR'}
                        />
                      </div>
                    </div>

                    <div className="reg-field">
                      <label className="reg-label">{t('select_stack')}</label>
                      <select
                        value={stackId}
                        onChange={(e) => setStackId(e.target.value ? Number(e.target.value) : '')}
                        className="reg-select"
                        required={role === 'MENTOR'}
                      >
                        <option value="" disabled>-- {t('select_stack')} --</option>
                        {stacks.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  <div className="reg-field">
                    <label className="reg-label">{t('hourly_rate')}</label>
                    <div className="reg-input-wrap">
                      <span className="reg-icon"><DollarSign size={16} /></span>
                      <input
                        type="number"
                        value={hourlyRate || ''}
                        onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : 0)}
                        placeholder="e.g. 50"
                        min="0"
                        className="reg-input"
                        required={role === 'MENTOR'}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  {/* <div className="reg-field">
                    <label className="reg-label">{t('mentor_bio')}</label>
                    <div className="reg-input-wrap">
                      <span className="reg-icon" style={{ alignItems: 'flex-start', paddingTop: '0.75rem' }}>
                        <FileText size={16} />
                      </span>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell students about yourself, your experience, and teaching style..."
                        rows={3}
                        className="reg-textarea"
                      />
                    </div>
                  </div> */}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="reg-submit">
                {isLoading ? (
                  <div className="reg-spinner" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>{t('sign_up')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="reg-divider">
              <div className="reg-divider-line" />
              <span className="reg-divider-text">{t('or_continue_with')}</span>
              <div className="reg-divider-line" />
            </div>

            {/* Google Button */}
            <button type="button" onClick={handleGoogleLogin} className="reg-google-btn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{t('google_sign_in')}</span>
            </button>

            {/* Footer */}
            <div className="reg-footer">
              {t('have_account')}
              <Link to="/login">{t('sign_in')}</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterPage
