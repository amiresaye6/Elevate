import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'
import { toast } from 'react-hot-toast'
import {
  Calendar,
  Clock,
  Video,
  Award,
  Star,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Eye
} from 'lucide-react'

interface Stack {
  id: number
  name: string
  description: string
}

interface Mentor {
  id: number
  name: string
  title: string
  bio: string
  stack?: Stack
}

interface Session {
  id: number
  mentorId: number
  studentId: number
  startTime: string
  endTime: string
  description: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED'
  evaluationNotes: string | null
  mentor: Mentor
  student: {
    id: number
    name: string
  }
}

const StudentDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation(['student', 'common'])
  const isRtl = i18n.language.startsWith('ar')

  // States
  const [studentName, setStudentName] = useState('Amir Alsayed')
  const [totalSessions, setTotalSessions] = useState(0)
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [latestFeedbackSession, setLatestFeedbackSession] = useState<Session | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all dashboard components concurrently
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch total sessions & student profile name
      const totalRes = await api.get('/sessions', {
        params: { role: 'student', page: 1, limit: 10 }
      })

      // 2. Fetch upcoming sessions list and count
      const upcomingRes = await api.get('/sessions', {
        params: { role: 'student', status: 'SCHEDULED', page: 1, limit: 2 }
      })

      // 3. Fetch completed sessions list and count
      const completedRes = await api.get('/sessions', {
        params: { role: 'student', status: 'COMPLETED', page: 1, limit: 5 }
      })

      // Parse student name
      if (totalRes.data && totalRes.data.success && totalRes.data.data.length > 0) {
        setStudentName(totalRes.data.data[0].student.name)
      }

      // Set counts
      setTotalSessions(totalRes.data?.pagination?.totalItems || 0)
      setUpcomingCount(upcomingRes.data?.pagination?.totalItems || 0)
      setCompletedCount(completedRes.data?.pagination?.totalItems || 0)

      // Set sessions list
      setUpcomingSessions(upcomingRes.data?.data || [])
      
      // Get the latest feedback notes
      if (completedRes.data && completedRes.data.success && completedRes.data.data.length > 0) {
        // Find the first completed session with evaluation notes
        const feedbackSession = completedRes.data.data.find((s: Session) => s.evaluationNotes !== null)
        if (feedbackSession) {
          setLatestFeedbackSession(feedbackSession)
        }
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to fetch dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Format Date & Time helper
  const formatDateTime = (dateStr: string) => {
    const dateObj = new Date(dateStr)
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' }
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true }

    const formattedDate = new Intl.DateTimeFormat(i18n.language, dateOptions).format(dateObj)
    const formattedTime = new Intl.DateTimeFormat(i18n.language, timeOptions).format(dateObj)

    return {
      date: formattedDate,
      time: `${formattedTime} EST`
    }
  }

  const handleJoinSession = () => {
    toast.success(t('toast_join_session'))
  }

  // Render subtext based on upcoming counts
  const renderWelcomeSubtext = () => {
    if (upcomingCount === 0) return t('welcome_subtext_zero')
    if (upcomingCount === 1) return t('welcome_subtext_one')
    return t('welcome_subtext', { count: upcomingCount })
  }

  return (
    <div className="space-y-8">
      {loading ? (
        // Dashboard Skeletons
        <div className="space-y-8 animate-pulse">
          {/* Welcome Card Skeleton */}
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
          
          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-40"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
          </div>
        </div>
      ) : error ? (
        // Error State
        <div className="bg-rose-500/5 border border-rose-500/15 p-6 rounded-2xl text-center max-w-md mx-auto space-y-4 py-8">
          <TrendingUp className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">{t('error_loading')}</h3>
          <p className="text-xs text-slate-400">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-500 transition-colors text-xs"
          >
            {t('error_retry')}
          </button>
        </div>
      ) : (
        // Dashboard Content
        <>
          {/* Welcome Jumbotron Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 border border-slate-800 dark:border-slate-900/60 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
            
            <div className="space-y-2 relative z-10 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {t('welcome_title', { name: studentName.split(' ')[0] })}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                {renderWelcomeSubtext()}
              </p>
            </div>

            {/* Stats widgets inside Welcome Card */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md min-w-[100px] md:min-w-[120px]">
                <span className="text-[10px] md:text-xs text-slate-300 font-bold uppercase tracking-wider block mb-1">
                  {t('stat_total_sessions')}
                </span>
                <span className="text-xl md:text-3xl font-extrabold bg-gradient-to-tr from-white to-slate-300 bg-clip-text text-transparent">
                  {totalSessions}
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md min-w-[100px] md:min-w-[120px]">
                <span className="text-[10px] md:text-xs text-slate-300 font-bold uppercase tracking-wider block mb-1">
                  {t('stat_upcoming')}
                </span>
                <span className="text-xl md:text-3xl font-extrabold text-indigo-400">
                  {upcomingCount}
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md min-w-[100px] md:min-w-[120px]">
                <span className="text-[10px] md:text-xs text-slate-300 font-bold uppercase tracking-wider block mb-1">
                  {t('stat_completed')}
                </span>
                <span className="text-xl md:text-3xl font-extrabold text-emerald-400">
                  {completedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Main Grid: Upcoming Sessions & Sidebar panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Upcoming Sessions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  {t('upcoming_sessions_title')}
                </h3>
                <Link
                  to="/student/sessions"
                  className="text-xs md:text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  <span>{t('view_all')}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </Link>
              </div>

              {upcomingSessions.length === 0 ? (
                // Upcoming Empty State
                <div className="bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800/40 rounded-xl flex items-center justify-center mx-auto text-slate-400">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{t('no_sessions_title')}</h4>
                    <p className="text-xs text-slate-400">{t('no_sessions_desc')}</p>
                  </div>
                  <div className="pt-2">
                    <Link
                      to="/mentors"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                    >
                      {t('new_session')}
                    </Link>
                  </div>
                </div>
              ) : (
                // Upcoming List grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingSessions.map((session, index) => {
                    const { date, time } = formatDateTime(session.startTime)
                    const mentorInitials = session.mentor.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2)
                    
                    return (
                      <div
                        key={session.id}
                        className="bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Mentor Header */}
                          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                              {mentorInitials}
                            </div>
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                              <h4 className="font-bold text-slate-800 dark:text-white leading-tight flex items-center gap-1.5 flex-wrap">
                                <span>{session.mentor.name}</span>
                                {session.mentor.stack && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                    {session.mentor.stack.name}
                                  </span>
                                )}
                              </h4>
                              <span className="text-xs text-slate-400 font-medium">
                                {session.mentor.title}
                              </span>
                            </div>
                          </div>

                          {/* Time details */}
                          <div className="space-y-2 pt-2">
                            <div className={`flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <Calendar className="w-4 h-4 text-indigo-500" />
                              <span>{date}</span>
                            </div>
                            <div className={`flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <Clock className="w-4 h-4 text-indigo-500" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action triggers */}
                        <div className="pt-3 flex gap-2">
                          {index === 0 ? (
                            <>
                              <button
                                onClick={handleJoinSession}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-2.5 text-xs shadow-md shadow-indigo-600/10 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Video className="w-4 h-4" />
                                <span>{t('join_session_btn')}</span>
                              </button>
                              <Link
                                to={`/student/sessions/${session.id}`}
                                className="px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors flex items-center justify-center"
                                title={t('action_view_details')}
                              >
                                <Eye className="w-4.5 h-4.5" />
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link
                                to="/student/sessions"
                                className="flex-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-semibold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center"
                              >
                                <span>{t('reschedule_btn')}</span>
                              </Link>
                              <Link
                                to={`/student/sessions/${session.id}`}
                                className="px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors flex items-center justify-center"
                                title={t('action_view_details')}
                              >
                                <Eye className="w-4.5 h-4.5" />
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right side: Sidebar metrics */}
            <div className="space-y-6">
              
              {/* Feedback Summary Card */}
              <div className="bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" />
                  {t('latest_feedback_title')}
                </h3>

                 {latestFeedbackSession ? (
                  <div className="space-y-3.5 pt-2">
                    {/* Mentor profile */}
                    <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Link
                        to={`/mentor/${latestFeedbackSession.mentorId}`}
                        className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {latestFeedbackSession.mentor.name}
                      </Link>
                      
                      {/* Ratings */}
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    {/* Feedback notes */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850 p-4 rounded-xl italic">
                      &ldquo;{latestFeedbackSession.evaluationNotes}&rdquo;
                    </p>

                    {/* Metadata & Actions */}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Completed &bull; {latestFeedbackSession.mentor.title}
                      </span>
                      <Link
                        to={`/student/book/${latestFeedbackSession.mentorId}`}
                        className="text-[11px] text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold hover:underline"
                      >
                        {t('book_again')} &rarr;
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic text-center py-6 space-y-3">
                    <p>{t('no_feedback_yet')}</p>
                    <Link
                      to="/mentors"
                      className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {t('common:discover.find_your_mentor')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Progress Gauges Card */}
              <div className="bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  {t('monthly_progress_title')}
                </h3>

                {/* Progress bar 1: Completed Sessions */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t('monthly_sessions_progress')}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {completedCount} / 10
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((completedCount / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Progress bar 2: Goal Alignment */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t('goal_alignment')}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      92%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: '92%' }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default StudentDashboardPage
