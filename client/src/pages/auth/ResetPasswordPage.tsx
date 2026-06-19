import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import authService from '../../services/authService'
import { Lock, ArrowLeft, Key, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Invalid or missing password reset token.')
      return
    }
    if (!newPassword || !confirmNewPassword) {
      toast.error('Please fill in all fields.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.resetPassword({ token, newPassword })
      if (res.success) {
        toast.success(res.message || 'Password reset successfully!')
        navigate('/login')
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to reset password.'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .rp-page {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          box-sizing: border-box;
        }
        .rp-wrapper {
          width: 460px;
          max-width: 100%;
          position: relative;
        }
        .rp-glow {
          position: absolute;
          inset: -8px;
          border-radius: 22px;
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, #6366f1 100%);
          filter: blur(22px);
          opacity: 0.18;
          pointer-events: none;
          transition: opacity 0.4s;
        }
        .rp-wrapper:hover .rp-glow {
          opacity: 0.26;
        }
        .rp-card {
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
        .rp-title {
          text-align: center;
        }
        .rp-title h1 {
          font-size: 1.875rem;
          font-weight: 800;
          background: linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.35rem;
        }
        .rp-title p {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.5;
        }
        .rp-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .rp-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .rp-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .rp-input-wrap {
          position: relative;
        }
        .rp-icon {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0.75rem;
          display: flex;
          align-items: center;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        .rp-input {
          width: 100%;
          padding: 0.75rem 2.75rem 0.75rem 2.5rem;
          background: hsl(var(--background) / 0.6);
          border: 1px solid hsl(var(--border));
          border-radius: 12px;
          outline: none;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .rp-input::placeholder {
          color: hsl(var(--muted-foreground) / 0.6);
        }
        .rp-input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
        }
        .rp-eye {
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
        .rp-eye:hover {
          color: hsl(var(--foreground));
        }
        .rp-submit {
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
        .rp-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px hsl(var(--primary) / 0.35);
        }
        .rp-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .rp-back {
          text-align: center;
        }
        .rp-back a {
          font-size: 0.8rem;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          transition: color 0.2s;
        }
        .rp-back a:hover {
          color: hsl(var(--foreground));
        }
        .rp-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid hsl(var(--primary-foreground));
          border-top-color: transparent;
          border-radius: 50%;
          animation: rpSpin 0.7s linear infinite;
        }
        @keyframes rpSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="rp-page">
        <div className="rp-wrapper">
          <div className="rp-glow" />
          <div className="rp-card">

            <div className="rp-title">
              <h1>{t('reset_password_title')}</h1>
              <p>{t('reset_password_subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="rp-form">
              {/* New Password */}
              <div className="rp-field">
                <label className="rp-label">{t('new_password')}</label>
                <div className="rp-input-wrap">
                  <span className="rp-icon"><Lock size={16} /></span>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rp-input"
                    required
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowNew(!showNew)}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="rp-field">
                <label className="rp-label">{t('confirm_new_password')}</label>
                <div className="rp-input-wrap">
                  <span className="rp-icon"><Lock size={16} /></span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rp-input"
                    required
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="rp-submit">
                {isLoading ? (
                  <div className="rp-spinner" />
                ) : (
                  <>
                    <Key size={16} />
                    <span>{t('reset_password_button')}</span>
                  </>
                )}
              </button>
            </form>

            <div className="rp-back">
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

export default ResetPasswordPage
