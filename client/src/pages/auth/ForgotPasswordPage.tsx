import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import authService from '../../services/authService'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common'])
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address.')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.forgotPassword({ email })
      if (res.success) {
        toast.success(res.message || 'Reset link sent!')
        setIsSent(true)
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to request reset link.'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .fp-page {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          box-sizing: border-box;
        }
        .fp-wrapper {
          width: 460px;
          max-width: 100%;
          position: relative;
        }
        .fp-glow {
          position: absolute;
          inset: -8px;
          border-radius: 22px;
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, #6366f1 100%);
          filter: blur(22px);
          opacity: 0.18;
          pointer-events: none;
          transition: opacity 0.4s;
        }
        .fp-wrapper:hover .fp-glow {
          opacity: 0.26;
        }
        .fp-card {
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
        .fp-title {
          text-align: center;
        }
        .fp-title h1 {
          font-size: 1.875rem;
          font-weight: 800;
          background: linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.35rem;
        }
        .fp-title p {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.5;
        }
        .fp-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .fp-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .fp-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .fp-input-wrap {
          position: relative;
        }
        .fp-icon {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0.75rem;
          display: flex;
          align-items: center;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        .fp-input {
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
        .fp-input::placeholder {
          color: hsl(var(--muted-foreground) / 0.6);
        }
        .fp-input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
        }
        .fp-submit {
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
        .fp-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px hsl(var(--primary) / 0.35);
        }
        .fp-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .fp-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: hsl(142 71% 45% / 0.1);
          border: 1px solid hsl(142 71% 45% / 0.25);
          border-radius: 14px;
          text-align: center;
        }
        .fp-success-icon {
          color: hsl(142 71% 45%);
        }
        .fp-success p {
          font-size: 0.875rem;
          font-weight: 600;
          color: hsl(142 71% 45%);
          line-height: 1.5;
        }
        .fp-back {
          text-align: center;
        }
        .fp-back a {
          font-size: 0.8rem;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          transition: color 0.2s;
        }
        .fp-back a:hover {
          color: hsl(var(--foreground));
        }
        .fp-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid hsl(var(--primary-foreground));
          border-top-color: transparent;
          border-radius: 50%;
          animation: fpSpin 0.7s linear infinite;
        }
        @keyframes fpSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="fp-page">
        <div className="fp-wrapper">
          <div className="fp-glow" />
          <div className="fp-card">

            <div className="fp-title">
              <h1>{t('forgot_password_title')}</h1>
              <p>{t('forgot_password_subtitle')}</p>
            </div>

            {!isSent ? (
              <form onSubmit={handleSubmit} className="fp-form">
                <div className="fp-field">
                  <label className="fp-label">{t('email')}</label>
                  <div className="fp-input-wrap">
                    <span className="fp-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="fp-input"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="fp-submit">
                  {isLoading ? (
                    <div className="fp-spinner" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{t('send_reset_link')}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="fp-success">
                <CheckCircle size={32} className="fp-success-icon" />
                <p>
                  If the email exists, a password reset link has been successfully sent to <strong>{email}</strong>.
                </p>
              </div>
            )}

            <div className="fp-back">
              <Link to="/login">
                <ArrowLeft size={14} />
                {t('back_to_login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordPage
