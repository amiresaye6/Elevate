import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../store'
import { fetchMentorSessions, updateSession } from '../../store/slices/sessionSlice'
import type { SessionStatus } from '../../types/mentor.types'

export default function SessionsPage() {
  const dispatch = useAppDispatch()
  
  const { user } = useAppSelector((s) => s.auth)
  const { sessions, loading, error } = useAppSelector((s) => s.session)
  const MENTOR_ID = user?.mentorProfileId ?? 1

  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [evaluationNotes, setEvaluationNotes] = useState<Record<number, string>>({})

  useEffect(() => {
    if (MENTOR_ID) {
      dispatch(fetchMentorSessions(MENTOR_ID))
    }
  }, [dispatch, MENTOR_ID])

  const handleStatusUpdate = async (
    sessionId: number,
    status: SessionStatus
  ) => {
    const notes = evaluationNotes[sessionId] ?? ''

    if (status === 'COMPLETED' && notes.trim().length < 20) {
      toast.error('Evaluation notes must be at least 20 characters')
      return
    }

    setUpdatingId(sessionId)
    try {
      await dispatch(
        updateSession({
          sessionId,
          payload: {
            status,
            ...(status === 'COMPLETED' && { evaluationNotes: notes }),
          },
        })
      ).unwrap()
      toast.success(`Session marked as ${status}`)
      dispatch(fetchMentorSessions(MENTOR_ID))
    } catch (err: any) {
      toast.error(err ?? 'Failed to update session')
    } finally {
      setUpdatingId(null)
    }
  }

  const statusColor: Record<SessionStatus, { bg: string; text: string; border: string }> = {
    SCHEDULED: { bg: '#1f2a3c', text: '#c0c1ff', border: '#c0c1ff' },
    COMPLETED: { bg: '#1a2e1a', text: '#4ade80', border: '#4ade80' },
    CANCELED:  { bg: '#2e1a1a', text: '#ffb4ab', border: '#93000a' },
  }

  const safeSessions = Array.isArray(sessions) 
  ? sessions 
  : (sessions as any)?.data || (sessions as any)?.sessions || [];

  return (
    <div className="space-y-8 font-sans">

      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: '#d8e3fb', fontFamily: 'Geist, sans-serif' }}
        >
          Session Management
        </h1>
        <p className="text-sm mt-1" style={{ color: '#c7c4d7' }}>
          Review and update your session statuses.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div
            className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
            style={{ borderColor: '#c0c1ff' }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p
          className="text-sm px-4 py-3 rounded-lg border"
          style={{
            background: '#93000a22',
            color: '#ffb4ab',
            border: '1px solid #93000a',
          }}
        >
          {error}
        </p>
      )}

      {/* Empty */}
      {!loading && safeSessions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: '#908fa0' }}>
            No sessions found.
          </p>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {safeSessions.map((session: any) => {
          if (!session) return null;

          // حماية الـ statusColor من الـ undefined لو الـ status راجعة lowercase أو ممسوحة
          const currentStatus = (session.status || 'SCHEDULED').toUpperCase() as SessionStatus
          const colors = statusColor[currentStatus] || statusColor.SCHEDULED

          return (
            <div
              key={session.id}
              className="rounded-xl border p-5 space-y-4"
              style={{ background: '#152031', border: '1px solid #464554' }}
            >
              {/* Session Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p
                    className="font-medium text-sm"
                    style={{ color: '#d8e3fb' }}
                  >
                    {session.description}
                  </p>
                  <p className="text-xs" style={{ color: '#908fa0' }}>
                    Student: {session.student?.name ?? 'N/A'}
                  </p>
                  <p className="text-xs" style={{ color: '#908fa0' }}>
                    {session.startTime ? new Date(session.startTime).toLocaleString() : 'N/A'} →{' '}
                    {session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium shrink-0 border"
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    fontFamily: 'Geist, sans-serif',
                  }}
                >
                  {currentStatus}
                </span>
              </div>

              {/* Actions — only for SCHEDULED */}
              {currentStatus === 'SCHEDULED' && (
                <div className="space-y-3 pt-2 border-t" style={{ borderColor: '#464554' }}>

                  {/* Evaluation Notes */}
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-medium uppercase tracking-widest"
                      style={{ color: '#908fa0', fontFamily: 'Geist, sans-serif' }}
                    >
                      Evaluation Notes (required to complete)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write evaluation notes (min 20 characters)..."
                      value={evaluationNotes[session.id] ?? ''}
                      onChange={(e) =>
                        setEvaluationNotes((prev) => ({
                          ...prev,
                          [session.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border resize-none transition-all"
                      style={{
                        background: '#0d1826',
                        border: '1px solid #464554',
                        color: '#d8e3fb',
                      }}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusUpdate(session.id, 'COMPLETED')}
                      disabled={updatingId === session.id}
                      className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
                      style={{
                        background: '#c0c1ff',
                        color: '#1000a9',
                        fontFamily: 'Geist, sans-serif',
                      }}
                    >
                      {updatingId === session.id ? 'Saving...' : 'Mark Completed'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(session.id, 'CANCELED')}
                      disabled={updatingId === session.id}
                      className="px-4 py-2 rounded-lg text-xs font-medium border transition-all hover:opacity-70 disabled:opacity-50"
                      style={{
                        border: '1px solid #93000a',
                        color: '#ffb4ab',
                        background: 'transparent',
                      }}
                    >
                      Cancel Session
                    </button>
                  </div>
                </div>
              )}

              {/* Show evaluation notes if COMPLETED */}
              {currentStatus === 'COMPLETED' && session.evaluationNotes && (
                <div
                  className="rounded-lg px-4 py-3 border-t pt-3"
                  style={{ borderColor: '#464554' }}
                >
                  <p
                    className="text-xs font-medium uppercase tracking-widest mb-1"
                    style={{ color: '#908fa0', fontFamily: 'Geist, sans-serif' }}
                  >
                    Evaluation Notes
                  </p>
                  <p className="text-sm" style={{ color: '#d8e3fb' }}>
                    {session.evaluationNotes}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}