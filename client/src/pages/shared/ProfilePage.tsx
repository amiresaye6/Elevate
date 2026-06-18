import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import authService from '../../services/authService'
import { User, Mail, Shield, Calendar, Lock, Save, Briefcase, FileText, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface Stack {
  id: number
  name: string
  description: string
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common'])

  // Loading and profile state
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Profile Form States
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState<number>(0)
  const [stackId, setStackId] = useState<number | ''>('')
  const [stacks, setStacks] = useState<Stack[]>([])

  // Password Change States
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Fetch profile and stacks on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await authService.getProfile()
        if (profileRes.success && profileRes.data) {
          const u = profileRes.data
          setProfile(u)
          setName(u.name || '')
          setTitle(u.title || '')
          setBio(u.bio || '')
          setHourlyRate(u.hourlyRate ? Number(u.hourlyRate) : 0)
          setStackId(u.stackId || '')

          // Fetch stacks list if mentor
          if (u.role === 'MENTOR') {
            const stacksRes = await api.get('/stacks')
            setStacks(stacksRes.data || [])
          }
        }
      } catch (err: any) {
        toast.error('Failed to load profile details.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfileData()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      toast.error('Name is required.')
      return
    }

    setIsSavingProfile(true)
    try {
      const payload: any = { name }
      if (profile.role === 'MENTOR') {
        payload.title = title
        payload.bio = bio
        payload.hourlyRate = Number(hourlyRate)
        payload.stackId = Number(stackId)
      }

      const res = await authService.updateProfile(payload)
      if (res.success) {
        toast.success(res.message || 'Profile updated successfully!')
        // Update local profile state
        setProfile((prev: any) => ({
          ...prev,
          name,
          title,
          bio,
          hourlyRate,
          stackId,
        }))
        // Sync new name with localStorage user object
        const localUserStr = localStorage.getItem('user')
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr)
          localUser.name = name
          localStorage.setItem('user', JSON.stringify(localUser))
        }
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile.'
      toast.error(errMsg)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsSavingPassword(true)
    try {
      const res = await authService.changePassword({ oldPassword, newPassword })
      if (res.success) {
        toast.success(res.message || 'Password changed successfully!')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to change password.'
      toast.error(errMsg)
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('update_profile')}</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal settings, roles, and password configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Card: Account Summary */}
        <div className="bg-card/40 backdrop-blur-md border border-border/60 shadow-lg rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 text-primary">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="h-10 w-10 animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{name || 'User Profile'}</h2>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1 inline-block bg-muted/60 px-2.5 py-0.5 rounded-full">
              {profile.role}
            </p>
          </div>

          <div className="w-full border-t border-border/40 pt-4 flex flex-col gap-3 text-left text-sm text-muted-foreground font-semibold">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary/70" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/70" />
              <span>Status: {profile.isBlocked ? 'Blocked' : 'Active'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary/70" />
              <span>Joined: {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Content Area: Profile & Password Cards */}
        <div className="md:col-span-2 flex flex-col gap-8">
          {/* Card 1: Profile Settings */}
          <div className="bg-card/40 backdrop-blur-md border border-border/60 shadow-lg rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border/40 pb-2">
              <User className="h-5 w-5 text-primary" />
              <span>{t('profile_info')}</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm text-foreground"
                  required
                />
              </div>

              {/* MENTOR specific details */}
              {profile.role === 'MENTOR' && (
                <div className="flex flex-col gap-4 border-t border-border/30 pt-4 mt-2">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('mentor_title')}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-background/50 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm text-foreground"
                        required
                      />
                    </div>
                  </div>

                  {/* Stacks select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('select_stack')}
                    </label>
                    <select
                      value={stackId}
                      onChange={(e) => setStackId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm text-foreground appearance-none"
                      required
                    >
                      <option value="" disabled className="bg-background">
                        -- {t('select_stack')} --
                      </option>
                      {stacks.map((s) => (
                        <option key={s.id} value={s.id} className="bg-background">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hourly Rate */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('hourly_rate')}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                      </span>
                      <input
                        type="number"
                        value={hourlyRate || ''}
                        onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : 0)}
                        className="w-full pl-10 pr-3 py-2 bg-background/50 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm text-foreground"
                        required
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('mentor_bio')}
                    </label>
                    <div className="relative">
                      <span className="absolute top-3 left-3 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </span>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full pl-10 pr-3 py-2 bg-background/50 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm text-foreground resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* Save profile button */}
              <button
                type="submit"
                disabled={isSavingProfile}
                className="mt-2 py-2 bg-primary text-primary-foreground hover:bg-primary/95 transition font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{t('save_changes')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card 2: Password Change */}
          <div className="bg-card/40 backdrop-blur-md border border-border/60 shadow-lg rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border/40 pb-2">
              <Lock className="h-5 w-5 text-primary" />
              <span>{t('change_password_title')}</span>
            </h3>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('old_password')}
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm text-foreground"
                  required
                />
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('new_password')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm text-foreground"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('confirm_password')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm text-foreground"
                  required
                />
              </div>

              {/* Save password button */}
              <button
                type="submit"
                disabled={isSavingPassword}
                className="mt-2 py-2 bg-primary text-primary-foreground hover:bg-primary/95 transition font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSavingPassword ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{t('change_password_title')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
