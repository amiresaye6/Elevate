import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'
import { toast } from 'react-hot-toast'
import {
  Search,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

interface AuditLog {
  id: number
  predictedTag: string
  confidenceScore: number
  status: string
  latencyMs: number
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
  auditLog: AuditLog | null
}

const SessionHistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation(['student'])
  const isRtl = i18n.language.startsWith('ar')
  const navigate = useNavigate()

  // State
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(4) // Matches screenshot's exact row count
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELED'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')



  // Session for Cancellation Confirmation Modal
  const [cancelTargetSession, setCancelTargetSession] = useState<Session | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to first page on search
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Fetch sessions
  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter

      const response = await api.get('/sessions', {
        params: {
          role: 'student',
          status: statusParam,
          page,
          limit,
        },
      })

      if (response.data && response.data.success) {
        setSessions(response.data.data)
        setTotalItems(response.data.pagination.totalItems)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to load sessions')
      toast.error(t('error_loading'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [page, statusFilter])

  // Client-side filter matching the search term
  const filteredSessions = sessions.filter((session) => {
    if (!debouncedSearch) return true
    const searchLower = debouncedSearch.toLowerCase()
    return (
      session.mentor.name.toLowerCase().includes(searchLower) ||
      (session.mentor.title && session.mentor.title.toLowerCase().includes(searchLower)) ||
      session.description.toLowerCase().includes(searchLower)
    );
  });

  // Calculate duration
  const getDurationString = (start: string, end: string) => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime()
    const diffMins = Math.round(diffMs / (60 * 1000))
    return `${diffMins} ${t('min_suffix')}`
  }

  // Format Date and Time
  const formatDateTime = (dateStr: string) => {
    const dateObj = new Date(dateStr)

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }

    const formattedDate = new Intl.DateTimeFormat(i18n.language, dateOptions).format(dateObj)
    const formattedTime = new Intl.DateTimeFormat(i18n.language, timeOptions).format(dateObj)

    return {
      date: formattedDate,
      time: `${formattedTime} EST` // standardizing as EST for mock parity
    }
  }



  // Trigger Cancel Session
  const handleCancelTrigger = (session: Session) => {
    setCancelTargetSession(session)
    setShowCancelModal(true)
  }

  // Cancel Session Request
  const handleCancelConfirm = async () => {
    if (!cancelTargetSession) return
    setCancelling(true)
    try {
      const response = await api.put(`/sessions/${cancelTargetSession.id}/status?role=student`, {
        status: 'CANCELED'
      })

      if (response.data && response.data.success) {
        toast.success(t('toast_cancel_success'))
        setShowCancelModal(false)
        setCancelTargetSession(null)
        fetchSessions() // reload
      } else {
        throw new Error('Cancellation failed')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(t('toast_cancel_error'))
    } finally {
      setCancelling(false)
    }
  }

  // Render Status Badge
  const renderStatusBadge = (status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED') => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            {t('upcoming_badge')}
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('completed_badge')}
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

  return (
    <div className="space-y-6">
      {/* Search and Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-[#0d162e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
        {/* Search box */}
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_placeholder')}
            className={`w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all ${isRtl ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'
              }`}
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELED'] as const).map((filter) => {
            const isActive = statusFilter === filter
            const labelKey = `filter_${filter.toLowerCase()}` as const
            return (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter)
                  setPage(1)
                }}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 border border-transparent dark:border-slate-800/40'
                  }`}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#0d162e] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/40 text-slate-400 border-b border-slate-100 dark:border-slate-800/60">
              <tr>
                <th scope="col" className={`px-6 py-4 font-bold tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t('col_mentor')}
                </th>
                <th scope="col" className={`px-6 py-4 font-bold tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t('col_date_time')}
                </th>
                <th scope="col" className={`px-6 py-4 font-bold tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t('col_duration')}
                </th>
                <th scope="col" className={`px-6 py-4 font-bold tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t('col_status')}
                </th>
                <th scope="col" className={`px-6 py-4 font-bold tracking-wider ${isRtl ? 'text-right' : 'text-center'}`}>
                  {t('col_actions')}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {loading ? (
                // Table Skeletons
                Array.from({ length: limit }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20 rounded-full"></div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-8 mx-auto rounded-lg"></div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                // Error State
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">{t('error_loading')}</h3>
                      <p className="text-xs text-slate-400 text-center">{error}</p>
                      <button
                        onClick={fetchSessions}
                        className="mt-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10 text-xs"
                      >
                        {t('error_retry')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/40 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{t('no_sessions_title')}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{t('no_sessions_desc')}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data rows
                filteredSessions.map((session) => {
                  const { date, time } = formatDateTime(session.startTime)
                  const mentorInitials = session.mentor.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)

                  return (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors duration-150"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {/* Mentor Initials Avatar */}
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                            {mentorInitials}
                          </div>
                          <div className={isRtl ? 'text-right' : 'text-left'}>
                            <h4 className="font-bold text-slate-800 dark:text-white leading-tight">
                              {session.mentor.name}
                            </h4>
                            <span className="text-xs text-slate-400 font-medium">
                              {session.mentor.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className={`flex flex-col ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {date}
                          </span>
                          <span className="text-xs text-slate-400 font-medium mt-0.5">
                            {time}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 font-semibold text-slate-700 dark:text-slate-300">
                        {getDurationString(session.startTime, session.endTime)}
                      </td>

                      <td className="px-6 py-5">
                        {renderStatusBadge(session.status)}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="bg-white dark:bg-[#0e1730] border border-slate-200 dark:border-slate-800/80 shadow-xl rounded-xl p-1 z-55">
                            <DropdownMenuItem
                              onClick={() => navigate(`/student/sessions/${session.id}`)}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer focus:outline-none"
                            >
                              <Eye className="w-4 h-4 text-slate-400" />
                              <span>{t('action_view_details')}</span>
                            </DropdownMenuItem>

                            {session.status === 'SCHEDULED' && (
                              <DropdownMenuItem
                                onClick={() => handleCancelTrigger(session)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer focus:outline-none"
                              >
                                <XCircle className="w-4 h-4 text-rose-400" />
                                <span>{t('action_cancel')}</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {!loading && !error && totalItems > 0 && (
          <div className={`px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/10 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
            <span className="text-xs text-slate-400 font-medium">
              {t('showing_results', {
                start: (page - 1) * limit + 1,
                end: Math.min(page * limit, totalItems),
                total: totalItems
              })}
            </span>

            <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {/* Prev Button */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Number Buttons */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1
                const isActive = page === pageNum
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              {/* Next Button */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>



      {/* Cancellation Confirmation Modal */}
      {showCancelModal && cancelTargetSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          ></div>

          <div className="relative bg-white dark:bg-[#0e1730] border border-slate-200 dark:border-slate-850/80 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl z-10 p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">
              {t('cancel_confirm_title')}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {t('cancel_confirm_desc')}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 font-bold rounded-xl py-3 text-xs transition-colors border border-transparent dark:border-slate-800/40"
              >
                {t('cancel_cancel_btn')}
              </button>

              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-3 text-xs shadow-lg shadow-rose-600/10 transition-colors flex items-center justify-center gap-1.5"
              >
                {cancelling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <span>{t('cancel_confirm_btn')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionHistoryPage
