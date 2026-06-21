import { useEffect,useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store'
import { fetchMentorDashboard } from '../../store/slices/mentorSlice'
import { fetchMentorSessions } from '../../store/slices/sessionSlice'
import authService from '../../services/authService'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const dispatch = useAppDispatch()

  // const { user } = useAppSelector((s) => s.auth)
  // const MENTOR_ID = user?.mentorProfileId ?? 1
  const [mentorId, setMentorId] = useState<number | null>(null)
  const { dashboard, loading } = useAppSelector((s) => s.mentor)
  const sessionState = useAppSelector((s) => s.session)
  useEffect(() => {
    const loadMentorProfile = async () => {
      try {
        const res = await authService.getProfile()
        const realMentorId = (res.data as any)?.profile?.id
        if (realMentorId) setMentorId(realMentorId)
      } catch {
        toast.error('Failed to load mentor profile')
      }
    }
    loadMentorProfile()
  }, [])

  useEffect(() => {
    if (mentorId) {
      dispatch(fetchMentorDashboard(mentorId))
      dispatch(fetchMentorSessions(mentorId))
    }
  }, [dispatch, mentorId])
  

  const rawSessions = sessionState?.sessions
  const sessionsArray = Array.isArray(rawSessions)
    ? rawSessions
    : (rawSessions as any)?.data || (rawSessions as any)?.sessions || []

  const upcoming = sessionsArray.filter((s: any) => s?.status === 'SCHEDULED').slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
          style={{ borderColor: '#c0c1ff' }} />
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: '#c0c1ff' }}>
            Good morning
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight mt-1"
            style={{ color: '#d8e3fb', fontFamily: 'Geist, sans-serif' }}
          >
            {dashboard?.profile.name ?? 'Mentor'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#c7c4d7' }}>
            Here is your academic mentoring overview for today.
          </p>
        </div>
        <Link
          to="/mentor/availability"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:opacity-80"
          style={{
            background: '#152031',
            border: '1px solid #464554',
            color: '#c0c1ff',
          }}
        >
          Set Availability
        </Link>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Sessions',
            value: dashboard?.stats.totalSessions ?? 0,
            sub: 'all time',
          },
          {
            label: 'Avg. Rating',
            value: dashboard?.profile.averageRating ? dashboard.profile.averageRating.toFixed(1) : '0.0',
            sub: '/ 5.0',
          },
          {
            label: 'Completed',
            value: dashboard?.stats.completedSessions ?? 0,
            sub: 'sessions',
          },
          {
            label: 'Upcoming',
            value: dashboard?.stats.upcomingSessions ?? 0,
            sub: 'scheduled',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5 flex flex-col gap-2 border transition-all hover:border-opacity-80"
            style={{
              background: '#152031',
              border: '1px solid #464554',
            }}
          >
            <p
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: '#c7c4d7', fontFamily: 'Geist, sans-serif' }}
            >
              {stat.label}
            </p>
            <div className="flex items-end gap-1.5">
              <span
                className="text-3xl font-semibold"
                style={{ color: '#d8e3fb', fontFamily: 'Geist, sans-serif' }}
              >
                {stat.value}
              </span>
              <span className="text-sm mb-1" style={{ color: '#908fa0' }}>
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Sessions */}
        <div
          className="lg:col-span-2 rounded-xl border p-5 space-y-4"
          style={{ background: '#152031', border: '1px solid #464554' }}
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-base font-semibold"
              style={{ color: '#d8e3fb', fontFamily: 'Geist, sans-serif' }}
            >
              Upcoming Sessions
            </h2>
            <Link
              to="/mentor/sessions"
              className="text-xs font-medium hover:opacity-70 transition-opacity"
              style={{ color: '#c0c1ff' }}
            >
              View All
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div
              className="rounded-lg px-4 py-8 text-center"
              style={{ background: '#1f2a3c' }}
            >
              <p className="text-sm" style={{ color: '#908fa0' }}>
                No upcoming sessions scheduled.
              </p>
              <Link
                to="/mentor/availability"
                className="text-xs mt-2 inline-block hover:opacity-70"
                style={{ color: '#c0c1ff' }}
              >
                Set your availability →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 rounded-lg px-4 py-3 border"
                  style={{
                    background: '#1f2a3c',
                    border: '1px solid #464554',
                  }}
                >
                  {/* Time badge */}
                  <div
                    className="text-center rounded-lg px-3 py-2 min-w-[52px]"
                    style={{ background: '#2a3548' }}
                  >
                    <p
                      className="text-xs font-bold"
                      style={{
                        color: '#c0c1ff',
                        fontFamily: 'Geist, sans-serif',
                      }}
                    >
                      {new Date(session.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: '#d8e3fb' }}
                    >
                      {session.description}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#908fa0' }}>
                      {session.student?.name ?? 'Student'}
                    </p>
                  </div>

                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium shrink-0"
                    style={{
                      background: '#1f2a3c',
                      border: '1px solid #c0c1ff',
                      color: '#c0c1ff',
                    }}
                  >
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{ background: '#152031', border: '1px solid #464554' }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: '#d8e3fb', fontFamily: 'Geist, sans-serif' }}
          >
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              {
                label: 'Manage Availability',
                to: '/mentor/availability',
                desc: 'Set your weekly schedule',
              },
              {
                label: 'Review Sessions',
                to: '/mentor/sessions',
                desc: 'View and update session status',
              },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex flex-col gap-0.5 rounded-lg px-4 py-3 border transition-all hover:border-opacity-60 hover:opacity-90"
                style={{
                  background: '#1f2a3c',
                  border: '1px solid #464554',
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: '#d8e3fb' }}
                >
                  {action.label}
                </span>
                <span className="text-xs" style={{ color: '#908fa0' }}>
                  {action.desc}
                </span>
              </Link>
            ))}
          </div>

          {/* Availability summary */}
          <div
            className="rounded-lg px-4 py-3 border mt-2"
            style={{
              background: '#1f2a3c',
              border: '1px solid #464554',
            }}
          >
            <p
              className="text-xs font-medium uppercase tracking-widest mb-2"
              style={{ color: '#908fa0', fontFamily: 'Geist, sans-serif' }}
            >
              Availability Slots
            </p>
            <p
              className="text-2xl font-semibold"
              style={{ color: '#d8e3fb', fontFamily: 'Geist, sans-serif' }}
            >
              {dashboard?.stats.availabilitySlots ?? 0}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#908fa0' }}>
              slots configured
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}