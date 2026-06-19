import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft,
  Video,
  Calendar,
  FileText,
  Star,
  MessageSquare,
  User,
  XCircle,
  Clock,
  Download,
  AlertCircle
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
  averageRating: number
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
}

const SessionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['student'])
  const isRtl = i18n.language.startsWith('ar')

  // States
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch session details
  const fetchSessionDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/sessions/${id}`)
      if (response.data && response.data.success) {
        setSession(response.data.data)
      } else {
        throw new Error('Failed to load session details')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error fetching session details')
      toast.error(t('error_loading'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchSessionDetails()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="text-sm text-slate-400 font-semibold">{t('loading_mentor')}</span>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="bg-rose-500/5 border border-rose-500/15 p-6 rounded-2xl text-center max-w-md mx-auto space-y-4 py-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100">{t('error_loading')}</h3>
        <p className="text-xs text-slate-400">{error || 'Session not found'}</p>
        <button
          onClick={fetchSessionDetails}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-500 transition-colors text-xs"
        >
          {t('error_retry')}
        </button>
      </div>
    )
  }

  // Format Date and Time Range
  const formatSessionTime = (startStr: string, endStr: string) => {
    const start = new Date(startStr)
    const end = new Date(endStr)

    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' }
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true }

    const formattedDate = new Intl.DateTimeFormat(i18n.language, dateOptions).format(start)
    const formattedStartTime = new Intl.DateTimeFormat(i18n.language, timeOptions).format(start)
    const formattedEndTime = new Intl.DateTimeFormat(i18n.language, timeOptions).format(end)

    return `${formattedDate} • ${formattedStartTime} - ${formattedEndTime} EST`
  }

  // Calculate timeline milestone dates dynamically relative to startTime
  const getTimelineDates = () => {
    const start = new Date(session.startTime)
    const reqDate = new Date(start.getTime() - 6 * 24 * 60 * 60 * 1000)
    reqDate.setHours(9, 42, 0)
    
    const confDate = new Date(start.getTime() - 6 * 24 * 60 * 60 * 1000)
    confDate.setHours(13, 15, 0)

    const compDate = new Date(session.endTime)
    
    const feedbackDate = new Date(compDate.getTime() + 20.5 * 60 * 60 * 1000)

    const formatShort = (d: Date) => {
      const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' }
      const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true }
      return `${new Intl.DateTimeFormat(i18n.language, dateOpts).format(d)} • ${new Intl.DateTimeFormat(i18n.language, timeOpts).format(d)}`
    }

    return {
      requested: formatShort(reqDate),
      confirmed: formatShort(confDate),
      completed: formatShort(compDate),
      feedback: formatShort(feedbackDate)
    }
  }

  const timeline = getTimelineDates()

  // Status badge styles
  const renderStatusBadge = () => {
    switch (session.status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-3.5 h-3.5" />
            {t('upcoming_badge')}
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-350 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400">
            {t('completed_badge').toUpperCase()}
          </span>
        )
      case 'CANCELED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            {t('cancelled_badge')}
          </span>
        )
    }
  }

  const handleViewRecording = () => {
    toast.success(t('toast_recording_click'), {
      icon: '📹'
    })
  }

  const handleBookAgain = () => {
    toast.success(t('toast_book_again_click'))
    navigate(`/student/book/${session.mentorId}`)
  }

  return (
    <div className="space-y-6">
      {/* Back Navigator Link */}
      <Link
        to="/student/sessions"
        className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors ${
          isRtl ? 'flex-row-reverse' : ''
        }`}
      >
        <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        <span>{t('back_to_sessions')}</span>
      </Link>

      {/* Main Header Block */}
      <div className={`flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white dark:bg-[#0d162e] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm ${
        isRtl ? 'lg:flex-row-reverse text-right' : 'text-left'
      }`}>
        <div className="space-y-3">
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {renderStatusBadge()}
            <span className="text-xs text-slate-400 font-semibold">
              {formatSessionTime(session.startTime, session.endTime)}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {session.mentor.stack?.name || 'Mentorship'} Session Review
          </h2>
          
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Review the preparation notes and evaluation feedback from your session to reinforce key architecture and programming concepts.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className={`flex items-center gap-3 w-full lg:w-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
          {session.status === 'COMPLETED' && (
            <button
              onClick={handleViewRecording}
              className="flex-1 lg:flex-initial border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-200 font-bold rounded-xl px-5 py-3 text-xs md:text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Video className="w-4 h-4 text-slate-500" />
              <span>{t('session_recording')}</span>
            </button>
          )}

          <button
            onClick={handleBookAgain}
            className="flex-1 lg:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 py-3 text-xs md:text-sm shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>{t('book_again')}</span>
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Preparation Notes */}
          <div className={`bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 ${
            isRtl ? 'text-right' : 'text-left'
          }`}>
            <h3 className={`text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <FileText className="w-5.5 h-5.5 text-indigo-500" />
              {t('preparation_notes_title')}
            </h3>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('preparation_notes_sub')}
              </h4>
              
              {/* Display DB description string */}
              <div className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                {session.description}
              </div>
            </div>
          </div>

          {/* Card 2: Mentor Feedback (only visible if completed) */}
          {session.status === 'COMPLETED' && (
            <div className={`bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 ${
              isRtl ? 'text-right' : 'text-left'
            }`}>
              <h3 className={`text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Star className="w-5.5 h-5.5 text-indigo-500" />
                {t('mentor_feedback_title')}
              </h3>

              <div className={`flex flex-col md:flex-row gap-6 items-stretch ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                {/* Overall Rating Box */}
                <div className="w-full md:w-[150px] bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850/80 rounded-2xl p-5 flex flex-col items-center justify-center text-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t('overall_rating')}
                  </span>
                  
                  <span className="text-4xl font-extrabold text-slate-800 dark:text-white leading-none">
                    {session.mentor.averageRating.toFixed(1)}
                  </span>
                  
                  {/* Rating Stars */}
                  <div className="flex gap-0.5 mt-2.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Feedback Evaluation Notes */}
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-350 leading-relaxed italic bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                    &ldquo;{session.evaluationNotes || t('modal_no_evaluation')}&rdquo;
                  </p>
                  
                  <div className={`text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-3 ${
                    isRtl ? 'text-left' : 'text-right'
                  }`}>
                    Completed &bull; {session.mentor.title}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-8">
          
          {/* Card 1: Session Mentor */}
          <div className={`bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-5 ${
            isRtl ? 'text-right' : 'text-left'
          }`}>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('session_mentor_title')}
            </h4>

            <div className={`flex items-center gap-3.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {/* Mentor Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-extrabold text-base relative flex-shrink-0">
                {session.mentor.name.substring(0, 2).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </div>
              
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-white leading-tight">
                  {session.mentor.name}
                </h4>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold block mt-0.5">
                  {session.mentor.title}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                  San Francisco, CA (PST)
                </span>
              </div>
            </div>

            {/* Mentor Actions Links */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
              <button
                onClick={() => toast('Messaging is coming soon!', { icon: '💬' })}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('mentor_message')}</span>
              </button>

              <button
                onClick={() => toast.success(`Viewing ${session.mentor.name}'s profile...`)}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('mentor_profile')}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Session Timeline */}
          <div className={`bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-6 ${
            isRtl ? 'text-right' : 'text-left'
          }`}>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('session_timeline_title')}
            </h4>

            {/* Vertical timeline stepper */}
            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              
              {/* Step 1: Requested */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-[#0d162e] z-10 flex items-center justify-center"></span>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('timeline_requested')}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {timeline.requested}
                  </span>
                </div>
              </div>

              {/* Step 2: Confirmed */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-[#0d162e] z-10 flex items-center justify-center"></span>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('timeline_confirmed')}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {timeline.confirmed}
                  </span>
                </div>
              </div>

              {/* Step 3: Completed */}
              <div className="relative">
                <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#0d162e] z-10 flex items-center justify-center ${
                  session.status === 'COMPLETED' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}></span>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('timeline_completed')}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {session.status === 'COMPLETED' ? timeline.completed : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Step 4: Feedback */}
              <div className="relative">
                <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#0d162e] z-10 flex items-center justify-center ${
                  session.status === 'COMPLETED' && session.evaluationNotes ? 'bg-indigo-600 ring-4 ring-indigo-500/20' : 'bg-slate-200 dark:bg-slate-800'
                }`}></span>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('timeline_feedback')}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {session.status === 'COMPLETED' && session.evaluationNotes ? timeline.feedback : 'Pending'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Card 3: Shared Resources */}
          <div className={`bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-4 ${
            isRtl ? 'text-right' : 'text-left'
          }`}>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('shared_resources_title')}
            </h4>

            {/* Resource item row */}
            <div className={`flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl ${
              isRtl ? 'flex-row-reverse' : ''
            }`}>
              <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    session_materials.pdf
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">
                    PDF &bull; 1.4 MB
                  </span>
                </div>
              </div>

              <button
                onClick={() => toast.success('Starting document download...')}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                title="Download Resource"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default SessionDetailsPage
